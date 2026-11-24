import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { runMigrations } from '../db/migrator.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(here, '../uploads');

// A minimal PDF so the routine and materials pages have a real, downloadable
// file on a fresh install. Clearly labelled as a placeholder in the row itself.
const PLACEHOLDER_PDF = Buffer.from(
  [
    '%PDF-1.4',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj',
    '4 0 obj<</Length 74>>stream',
    'BT /F1 16 Tf 60 760 Td (Placeholder document - replace with the real file) Tj ET',
    'endstream endobj',
    '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
    'trailer<</Root 1 0 R>>',
    '%%EOF',
  ].join('\n'),
  'latin1'
);

const DEMO_PASSWORD = 'password123';
const BCRYPT_ROUNDS = 12;

const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering', faculty: 'Faculty of Science & Technology', sort: 10 },
  { code: 'EEE', name: 'Electrical & Electronic Engineering', faculty: 'Faculty of Science & Technology', sort: 20 },
  { code: 'BBA', name: 'Business Administration', faculty: 'Faculty of Business', sort: 30 },
  { code: 'ENG', name: 'English', faculty: 'Faculty of Arts', sort: 40 },
];

// Staff accounts exist so notices and routines can actually be authored.
// Passwords are dev defaults — override them in .env on a real deployment.
const USERS = [
  {
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@123',
    fullName: 'Portal Administrator',
  },
  {
    username: 'moderator',
    email: 'moderator@example.com',
    role: 'moderator',
    status: 'active',
    password: process.env.SEED_MODERATOR_PASSWORD || 'Moderator@123',
    fullName: 'Community Moderator',
  },
  { username: 'demo', email: 'demo@example.com', role: 'user', status: 'active', password: DEMO_PASSWORD },
  { username: 'writer', email: 'writer@example.com', role: 'user', status: 'active', password: DEMO_PASSWORD },
];

const POSTS = [
  {
    author: 'demo',
    cat: 'art',
    daysAgo: 1,
    title: 'The Quiet Craft of Analog Photography',
    desc: `<p>Working with film means giving up the instant feedback we have come to expect from a screen. Every exposure is a guess, informed by experience and a light meter you have to trust.</p><h2>Why bother with the wait</h2><p>The delay between pressing the shutter and holding the print is the whole point. It forces you to commit to a shot rather than take forty and hope.</p><ul><li>Twelve frames per roll makes each one deliberate</li><li>Grain reads as texture, not noise</li><li>No preview means no second-guessing</li></ul><p>The result is a slower, more attentive way of seeing.</p>`,
  },
  {
    author: 'writer',
    cat: 'science',
    daysAgo: 3,
    title: 'How CRISPR Rewrote the Rules of Biology',
    desc: `<p>For decades, editing a genome meant expensive, imprecise work. CRISPR turned it into something closer to find-and-replace.</p><h2>A bacterial defence system, repurposed</h2><p>The machinery evolved to cut up viral DNA. Guide it with a short RNA sequence and it will cut wherever you like.</p><blockquote>The precision is not in the enzyme. It is in the guide.</blockquote><p>That single insight is why labs around the world adopted it within a few years.</p>`,
  },
  {
    author: 'demo',
    cat: 'technology',
    daysAgo: 5,
    title: 'Why Your Next Laptop Might Not Have a Fan',
    desc: `<p>Fanless laptops used to mean slow laptops. That trade-off is disappearing, and the reason is less about raw speed than about heat density.</p><h2>The efficiency plateau</h2><p>Each generation of chip does the same work with less power. Less power means less heat, and less heat means you can pass it through the chassis instead of blowing it out the side.</p><p>The catch is sustained load: burst performance looks great on a spec sheet, but a thin chassis still throttles under a long export.</p>`,
  },
  {
    author: 'writer',
    cat: 'cinema',
    daysAgo: 8,
    title: 'The Long Take That Changed Cinema',
    desc: `<p>A single unbroken shot can do something a cut cannot: it refuses to let you look away.</p><h2>Duration as pressure</h2><p>Editing controls time. Remove the edit and the audience loses their sense of how long a scene is allowed to last. That uncertainty is the point.</p><ul><li>No cut means no relief</li><li>The camera's movement becomes the pacing</li><li>Mistakes are unrecoverable</li></ul>`,
  },
  {
    author: 'demo',
    cat: 'design',
    daysAgo: 12,
    title: 'Designing Interfaces People Actually Trust',
    desc: `<p>Trust is rarely earned by a large feature. It is earned by small consistencies repeated until the user stops checking.</p><h2>Predictability over delight</h2><p>A button that behaves the same way every time is worth more than one that surprises you. Delight is a bonus; predictability is a baseline.</p><p>Show state clearly, confirm destructive actions, and never move something the user is about to click.</p>`,
  },
  {
    author: 'writer',
    cat: 'food',
    daysAgo: 16,
    title: 'A Week of Cooking From One Pantry',
    desc: `<p>The constraint is the recipe. With a fixed shelf of ingredients, the interesting decisions move from "what should I buy" to "what does this become".</p><h2>The base three</h2><p>Almost everything here starts as one of three things: a sofrito, a broth, or a dressing. Change the aromatics and the same technique reads as a different cuisine.</p><ul><li>Beans, tinned tomatoes, onions</li><li>Rice, pasta, stale bread</li><li>Oil, vinegar, salt, and something acidic</li></ul>`,
  },
  {
    author: 'demo',
    cat: 'technology',
    daysAgo: 21,
    title: 'The Sound Engineers Behind Live Music',
    desc: `<p>What sounds effortless from the audience is a mix built and rebuilt all night, one room at a time.</p><h2>Every venue is a different instrument</h2><p>Concrete reflects, curtains absorb, and a full room behaves nothing like an empty one. The mix you sound-checked is already wrong by the first chorus.</p>`,
  },
  {
    author: 'writer',
    cat: 'art',
    daysAgo: 27,
    title: 'Restoring a Fresco, Micrometer by Micrometer',
    desc: `<p>Restoration is mostly restraint. The instinct to make something look new again is precisely the instinct that ruins it.</p><h2>Reversible by design</h2><p>Every material added must be removable decades later without harming the original. That rule shapes the chemistry more than aesthetics does.</p><p>Cleaning a square metre can take weeks, and the goal is not the painter's intention — it is whatever survives, shown honestly.</p>`,
  },
];

const mysqlDate = (daysAgo) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString().slice(0, 19).replace('T', ' ');

async function main() {
  const fresh = process.argv.includes('--fresh');
  const database = env.db.database;

  let connection;
  try {
    connection = await mysql.createConnection({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      multipleStatements: true,
    });
  } catch (err) {
    console.error(
      `✗ Cannot connect to MySQL at ${env.db.host}:${env.db.port}\n  ${err.message}`
    );
    process.exit(1);
  }

  console.log(`✓ Connected to MySQL at ${env.db.host}:${env.db.port}`);

  if (fresh) {
    await connection.query(`DROP DATABASE IF EXISTS \`${database.replace(/`/g, '')}\``);
    console.log('✓ Existing database dropped (--fresh)');
  }

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database.replace(/`/g, '')}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log(`✓ Database "${database}" ready`);

  await connection.end();

  const migration = await runMigrations({ log: (line) => console.log(line) });
  console.log(
    migration.applied
      ? `✓ Migrations applied (${migration.applied}/${migration.total})`
      : `✓ Migrations already up to date (${migration.total})`
  );

  connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database,
  });

  const [[{ userCount }]] = await connection.query(
    'SELECT COUNT(*) AS userCount FROM users'
  );

  if (userCount > 0) {
    const [[{ postCount }]] = await connection.query(
      'SELECT COUNT(*) AS postCount FROM posts'
    );
    console.log(
      `• Seed skipped: ${userCount} user(s) and ${postCount} post(s) already present.\n` +
        '  Use "npm run db:init -- --fresh" to wipe and reseed.'
    );
    await connection.end();
    return;
  }

  const departmentIds = {};
  for (const department of DEPARTMENTS) {
    const [result] = await connection.query(
      'INSERT INTO departments (code, name, faculty, sort_order) VALUES (?, ?, ?, ?)',
      [department.code, department.name, department.faculty, department.sort]
    );
    departmentIds[department.code] = result.insertId;
  }

  const userIds = {};
  for (const user of USERS) {
    const hash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
    const [result] = await connection.query(
      `INSERT INTO users (username, email, password, role, status, full_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.username, user.email, hash, user.role, user.status, user.fullName ?? null]
    );
    userIds[user.username] = result.insertId;
  }

  // Posts reference a category by id; the seed data stays readable using codes.
  const [categories] = await connection.query('SELECT id, code FROM categories');
  const categoryIdByCode = Object.fromEntries(categories.map((c) => [c.code, c.id]));

  const postIds = [];
  for (const post of POSTS) {
    const categoryId = categoryIdByCode[post.cat] ?? categoryIdByCode.general;
    const [result] = await connection.query(
      `INSERT INTO posts (title, \`desc\`, img, category_id, status, date, uid)
       VALUES (?, ?, ?, ?, 'published', ?, ?)`,
      [post.title, post.desc, null, categoryId, mysqlDate(post.daysAgo), userIds[post.author]]
    );
    postIds.push(result.insertId);
  }

  // Ratings from everyone except the author, so "top rated" has real data and
  // the post page has a score to show.
  const ratingValues = [5, 4, 5, 3, 4, 2];
  let ratingIndex = 0;
  for (const [index, postId] of postIds.entries()) {
    for (const user of USERS) {
      if (user.username === POSTS[index].author) continue;
      await connection.query(
        'INSERT IGNORE INTO post_ratings (post_id, user_id, value) VALUES (?, ?, ?)',
        [postId, userIds[user.username], ratingValues[ratingIndex++ % ratingValues.length]]
      );
    }
  }

  // A short thread on the first post: two roots and one reply.
  const [firstComment] = await connection.query(
    'INSERT INTO comments (post_id, user_id, body) VALUES (?, ?, ?)',
    [postIds[0], userIds.writer, 'The twelve-frames point is what finally sold me on shooting film.']
  );
  await connection.query(
    'INSERT INTO comments (post_id, user_id, parent_id, body) VALUES (?, ?, ?, ?)',
    [postIds[0], userIds.demo, firstComment.insertId, 'Same — it makes every frame a decision.']
  );
  const [secondComment] = await connection.query(
    'INSERT INTO comments (post_id, user_id, body) VALUES (?, ?, ?)',
    [postIds[0], userIds.moderator, 'Adding this to the reading list for next term.']
  );
  await connection.query(
    'INSERT INTO comment_votes (comment_id, user_id, value) VALUES (?, ?, 1)',
    [firstComment.insertId, userIds.admin]
  );
  await connection.query(
    'INSERT INTO comment_votes (comment_id, user_id, value) VALUES (?, ?, 1)',
    [secondComment.insertId, userIds.demo]
  );

  // One routine and one material, each with a real placeholder file on disk, so
  // those list views demonstrate themselves on a fresh install.
  fs.mkdirSync(uploadsDir, { recursive: true });

  const seedFiles = [
    {
      filename: 'seed-exam-routine.pdf',
      originalName: 'exam-routine-sample.pdf',
      kind: 'document',
      uploadedBy: userIds.admin,
    },
    {
      filename: 'seed-class-notes.pdf',
      originalName: 'class-notes-sample.pdf',
      kind: 'document',
      uploadedBy: userIds.writer,
    },
  ];

  const fileIds = {};
  for (const file of seedFiles) {
    fs.writeFileSync(path.join(uploadsDir, file.filename), PLACEHOLDER_PDF);
    const [row] = await connection.query(
      `INSERT INTO files (filename, original_name, mime_type, size_bytes, kind, uploaded_by)
       VALUES (?, ?, 'application/pdf', ?, ?, ?)`,
      [file.filename, file.originalName, PLACEHOLDER_PDF.length, file.kind, file.uploadedBy]
    );
    fileIds[file.filename] = row.insertId;
  }

  await connection.query(
    `INSERT INTO exam_routines
       (title, department_id, semester, exam_type, file_id, effective_from, notes, created_by)
     VALUES (?, ?, ?, 'final', ?, ?, ?, ?)`,
    [
      'Sample exam routine — Spring 2026',
      null,
      'Spring 2026',
      fileIds['seed-exam-routine.pdf'],
      mysqlDate(-14),
      // No admin-facing note here: this text is rendered on the public page.
      null,
      userIds.admin,
    ]
  );

  await connection.query(
    `INSERT INTO materials
       (title, description, course_code, department_id, semester, material_type, file_id, uploaded_by)
     VALUES (?, ?, ?, ?, ?, 'notes', ?, ?)`,
    [
      'Sample class notes — CSE 2101',
      'Sample notes document.',
      'CSE 2101',
      departmentIds.CSE,
      'Spring 2026',
      fileIds['seed-class-notes.pdf'],
      userIds.writer,
    ]
  );

  // Clearly-labelled sample content so the notice board and calendar are not
  // empty on a fresh install. Real notices come from staff accounts.
  const NOTICES = [
    {
      title: 'Sample notice — how the notice board works',
      body:
        'This is seeded demo content, not a real announcement. Staff accounts (admin and ' +
        'moderator) publish official notices here, pin the important ones, and they ' +
        'disappear automatically once their expiry date passes.',
      category: 'general',
      priority: 'normal',
      pinned: 1,
    },
    {
      title: 'Sample notice — exam section',
      body:
        'Seeded example of an exam-category notice. Replace it with a real one from the ' +
        'admin area; this row exists so the board has something to show on a fresh install.',
      category: 'exam',
      priority: 'important',
      pinned: 0,
    },
    {
      title: 'Sample notice — library opening hours',
      body:
        'Pluralised demo content so the notice board and the home panel have enough rows to ' +
        'show their real layout. Delete these once real announcements are published.',
      category: 'general',
      priority: 'normal',
      pinned: 0,
    },
    {
      title: 'Sample notice — scholarship applications',
      body: 'Another seeded example, this time in the scholarship category with normal priority.',
      category: 'scholarship',
      priority: 'urgent',
      pinned: 0,
    },
  ];

  for (const notice of NOTICES) {
    await connection.query(
      `INSERT INTO notices (title, body, category, priority, is_pinned, author_id, publish_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [notice.title, notice.body, notice.category, notice.priority, notice.pinned, userIds.admin]
    );
  }

  const EVENTS = [
    {
      title: 'Sample event — club orientation',
      description: 'Seeded demo event. Replace with a real one from the admin calendar.',
      daysAhead: 7,
      location: 'Main auditorium',
      kind: 'event',
    },
    {
      title: 'Sample calendar entry — midterm week',
      description: 'Seeded demo entry showing how exam weeks appear on the academic calendar.',
      daysAhead: 28,
      location: null,
      kind: 'exam_week',
    },
  ];

  for (const event of EVENTS) {
    await connection.query(
      `INSERT INTO events (title, description, starts_at, location, kind, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        event.title,
        event.description,
        mysqlDate(-event.daysAhead),
        event.location,
        event.kind,
        userIds.admin,
      ]
    );
  }

  // Community Q&A. Two of the four are left unanswered on purpose, so the
  // navbar badge has a number to show and the "Needs an answer" filter has
  // something in it on a fresh install.
  const QUESTIONS = [
    {
      asker: 'demo',
      cat: 'general',
      title: 'How do I register for a midterm retake after missing an exam?',
      body:
        'I was ill and missed the CSE 2101 midterm. What is the official process, and is there ' +
        'a deadline for submitting the medical certificate?',
      answer: 'admin',
      answerBody:
        'Take the medical certificate to the registrar within 7 days of the missed exam. They ' +
        'forward it to the department and the course teacher schedules the retake. After 7 days ' +
        'it also needs the dean\'s approval.',
      accept: true,
    },
    {
      asker: 'writer',
      cat: 'technology',
      title: 'Where can I find past question papers for CSE 2101?',
      body: 'Looking for the final papers from the last three semesters to practise from.',
      answer: 'admin',
      answerBody:
        'The Study Materials section has a past-papers filter, so check there first and ask the ' +
        'department office if a semester is missing.',
      accept: false,
    },
    {
      asker: 'demo',
      cat: 'general',
      title: 'Is the library open during the midterm week holidays?',
      body:
        'The calendar marks midterm week as a holiday period, but I need a quiet place to study.',
      answer: null,
    },
    {
      asker: 'writer',
      cat: 'admission',
      title: 'How do I collect my student ID card after uploading the photo?',
      body: 'I uploaded the photo two weeks ago and have not heard anything since.',
      answer: null,
    },
  ];

  for (const question of QUESTIONS) {
    const [row] = await connection.query(
      `INSERT INTO questions (title, body, category_id, asked_by)
       VALUES (?, ?, ?, ?)`,
      [
        question.title,
        question.body,
        categoryIdByCode[question.cat] ?? categoryIdByCode.general,
        userIds[question.asker],
      ]
    );

    if (!question.answer) continue;

    const [answer] = await connection.query(
      'INSERT INTO answers (question_id, body, answered_by) VALUES (?, ?, ?)',
      [row.insertId, question.answerBody, userIds[question.answer]]
    );

    if (question.accept) {
      await connection.query('UPDATE questions SET accepted_answer_id = ? WHERE id = ?', [
        answer.insertId,
        row.insertId,
      ]);
    }
  }

  console.log(
    `✓ Seeded ${DEPARTMENTS.length} departments, ${USERS.length} users, ` +
      `${POSTS.length} posts, ${NOTICES.length} notices, ${EVENTS.length} events, ` +
      `${QUESTIONS.length} questions`
  );
  console.log('\n  Logins (dev defaults — change these before deploying)');
  for (const user of USERS) {
    console.log(`    · ${user.username.padEnd(10)} ${user.role.padEnd(10)} ${user.password}`);
  }

  await connection.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
