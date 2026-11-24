import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../utils/audit.js';
import { isOwnerOrStaff } from '../middleware/authorize.js';

// Scalar subqueries rather than GROUP BY: the row filter and the answer count
// then share one shape, COUNT(*) for the total needs no wrapper query, and
// "unanswered" is one EXISTS instead of a HAVING clause that would have to be
// duplicated into the count.
const QUESTION_FIELDS = `
  q.id, q.title, q.body, q.status, q.views,
  q.asked_by AS askedById,
  q.accepted_answer_id AS acceptedAnswerId,
  q.created_at AS createdAt, q.updated_at AS updatedAt,
  u.username AS author, u.role AS authorRole, u.img AS authorImg,
  c.id AS categoryId, c.code AS categoryCode, c.name AS categoryName,
  c.accent_hue AS categoryHue,
  (SELECT COUNT(*) FROM answers a
    WHERE a.question_id = q.id AND a.status = 'published') AS answerCount
`;

const QUESTION_JOINS = `
  FROM questions q
  JOIN users u ON u.id = q.asked_by
  LEFT JOIN categories c ON c.id = q.category_id
`;

const HAS_ANSWER = `EXISTS (SELECT 1 FROM answers a
  WHERE a.question_id = q.id AND a.status = 'published')`;

const toNumber = (value) => Number(value ?? 0);

const normalizeQuestion = (row) => ({
  ...row,
  askedById: toNumber(row.askedById),
  answerCount: toNumber(row.answerCount),
  views: toNumber(row.views),
  acceptedAnswerId: row.acceptedAnswerId === null ? null : toNumber(row.acceptedAnswerId),
  // "solved" is what the listing actually renders, so derive it once here
  // rather than repeating the null check in every component.
  solved: row.acceptedAnswerId !== null && row.acceptedAnswerId !== undefined,
});

export async function listQuestions(req, res) {
  const { filter, category, q, page, pageSize } = req.validated.query;

  const where = ["q.status <> 'removed'"];
  const params = [];

  if (category) {
    where.push('c.code = ?');
    params.push(category);
  }

  if (q) {
    where.push('(q.title LIKE ? OR q.body LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  if (filter === 'unanswered') {
    where.push(`NOT ${HAS_ANSWER}`);
  } else if (filter === 'answered') {
    where.push(HAS_ANSWER);
  } else if (filter === 'mine') {
    if (!req.user) throw ApiError.unauthorized();
    where.push('q.asked_by = ?');
    params.push(req.user.id);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;

  const [{ total }] = await query(
    `SELECT COUNT(*) AS total ${QUESTION_JOINS} ${whereSql}`,
    params
  );

  // Oldest first when hunting for unanswered questions: the ones that have been
  // waiting longest deserve the attention, not the newest arrival.
  const orderBy = filter === 'unanswered' ? 'q.created_at ASC' : 'q.created_at DESC';

  const items = await query(
    `SELECT ${QUESTION_FIELDS} ${QUESTION_JOINS} ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize]
  );

  res.json({
    items: items.map(normalizeQuestion),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

/** Badge number for the navbar. Public, and deliberately tiny. */
export async function questionStats(req, res) {
  // query() already returns the row array, so this is one level of destructuring.
  const [{ total }] = await query(
    "SELECT COUNT(*) AS total FROM questions WHERE status <> 'removed'"
  );
  const [{ unanswered }] = await query(
    `SELECT COUNT(*) AS unanswered FROM questions q
      WHERE q.status <> 'removed' AND NOT ${HAS_ANSWER}`
  );

  res.json({
    total: toNumber(total),
    unanswered: toNumber(unanswered),
    answered: toNumber(total) - toNumber(unanswered),
  });
}

export async function getQuestion(req, res) {
  const { id } = req.validated.params;

  const [question] = await query(
    `SELECT ${QUESTION_FIELDS} ${QUESTION_JOINS} WHERE q.id = ? AND q.status <> 'removed'`,
    [id]
  );
  if (!question) throw ApiError.notFound('Question not found!');

  await query('UPDATE questions SET views = views + 1 WHERE id = ?', [id]);

  const answers = await query(
    `SELECT a.id, a.body, a.created_at AS createdAt,
            a.answered_by AS userId, u.username, u.role AS authorRole, u.img AS authorImg
       FROM answers a
       JOIN users u ON u.id = a.answered_by
      WHERE a.question_id = ? AND a.status = 'published'
      -- the accepted answer is pinned to the top
      ORDER BY (a.id = ?) DESC, a.created_at ASC`,
    [id, question.acceptedAnswerId ?? 0]
  );

  const payload = normalizeQuestion(question);
  payload.views += 1; // the increment above is not reflected in the row we read
  res.json({ ...payload, answers });
}

export async function createQuestion(req, res) {
  const { title, body, categoryId } = req.validated.body;

  if (categoryId) {
    const [category] = await query('SELECT id FROM categories WHERE id = ? LIMIT 1', [categoryId]);
    if (!category) throw ApiError.badRequest('That category does not exist.', 'UNKNOWN_CATEGORY');
  }

  const result = await query(
    'INSERT INTO questions (title, body, category_id, asked_by) VALUES (?, ?, ?, ?)',
    [title, body, categoryId || null, req.user.id]
  );

  await logAudit(req, {
    action: 'question.create',
    entityType: 'question',
    entityId: result.insertId,
    detail: { title },
  });

  const [question] = await query(
    `SELECT ${QUESTION_FIELDS} ${QUESTION_JOINS} WHERE q.id = ?`,
    [result.insertId]
  );
  res.status(201).json(normalizeQuestion(question));
}

export async function answerQuestion(req, res) {
  const { id } = req.validated.params;
  const { body } = req.validated.body;

  const [question] = await query(
    'SELECT id, status FROM questions WHERE id = ? LIMIT 1',
    [id]
  );
  if (!question || question.status === 'removed') throw ApiError.notFound('Question not found!');
  if (question.status === 'closed') {
    throw ApiError.badRequest('That question is closed to new answers.', 'QUESTION_CLOSED');
  }

  const result = await query(
    'INSERT INTO answers (question_id, body, answered_by) VALUES (?, ?, ?)',
    [id, body, req.user.id]
  );

  const [answer] = await query(
    `SELECT a.id, a.body, a.created_at AS createdAt,
            a.answered_by AS userId, u.username, u.role AS authorRole, u.img AS authorImg
       FROM answers a
       JOIN users u ON u.id = a.answered_by
      WHERE a.id = ?`,
    [result.insertId]
  );

  res.status(201).json(answer);
}

export async function acceptAnswer(req, res) {
  const { id } = req.validated.params;
  const { answerId } = req.validated.body;

  const [question] = await query(
    'SELECT id, asked_by, accepted_answer_id AS acceptedAnswerId, status FROM questions WHERE id = ? LIMIT 1',
    [id]
  );
  if (!question || question.status === 'removed') throw ApiError.notFound('Question not found!');

  const [answer] = await query('SELECT id, question_id FROM answers WHERE id = ? LIMIT 1', [
    answerId,
  ]);
  if (!answer || answer.question_id !== Number(id)) {
    throw ApiError.badRequest('That answer does not belong to this question.', 'BAD_ANSWER');
  }

  // Only the person who asked decides what solved it; staff can act on their behalf.
  if (!isOwnerOrStaff(req.user, question.asked_by)) {
    throw ApiError.forbidden('Only the person who asked can mark an accepted answer.');
  }

  // Marking the already-accepted answer again unmarks it, so this doubles as
  // "accepted" and "unaccepted" without a second endpoint.
  const next = question.acceptedAnswerId === Number(answerId) ? null : Number(answerId);

  await query('UPDATE questions SET accepted_answer_id = ? WHERE id = ?', [next, id]);
  await logAudit(req, {
    action: next ? 'question.accept' : 'question.unaccept',
    entityType: 'question',
    entityId: Number(id),
    detail: { answerId: Number(answerId) },
  });

  res.json({ id: Number(id), acceptedAnswerId: next, solved: next !== null });
}

export async function deleteQuestion(req, res) {
  const { id } = req.validated.params;

  const [question] = await query('SELECT id, asked_by FROM questions WHERE id = ? LIMIT 1', [id]);
  if (!question) throw ApiError.notFound('Question not found!');

  if (!isOwnerOrStaff(req.user, question.asked_by)) {
    throw ApiError.forbidden('You can delete only your own question.');
  }

  // Soft delete: answers cascade-delete on a hard delete, and a question that
  // was answered is worth keeping in the record.
  await query("UPDATE questions SET status = 'removed' WHERE id = ?", [id]);
  await logAudit(req, {
    action: 'question.remove',
    entityType: 'question',
    entityId: Number(id),
    detail: { byStaff: question.asked_by !== req.user.id },
  });

  res.json({ message: 'Question removed.', id: Number(id) });
}

export async function deleteAnswer(req, res) {
  const { id, answerId } = req.validated.params;

  const [answer] = await query(
    'SELECT id, answered_by FROM answers WHERE id = ? AND question_id = ? LIMIT 1',
    [answerId, id]
  );
  if (!answer) throw ApiError.notFound('Answer not found!');

  if (!isOwnerOrStaff(req.user, answer.answered_by)) {
    throw ApiError.forbidden('You can delete only your own answer.');
  }

  await query("UPDATE answers SET status = 'removed' WHERE id = ?", [answerId]);

  // Do not leave the question pointing at an answer nobody can see.
  await query(
    'UPDATE questions SET accepted_answer_id = NULL WHERE id = ? AND accepted_answer_id = ?',
    [id, answerId]
  );

  await logAudit(req, {
    action: 'answer.remove',
    entityType: 'answer',
    entityId: Number(answerId),
    detail: { questionId: Number(id), byStaff: answer.answered_by !== req.user.id },
  });

  res.json({ message: 'Answer removed.', id: Number(answerId) });
}
