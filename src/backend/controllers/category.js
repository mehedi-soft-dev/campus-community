import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';

const CATEGORY_FIELDS = `
  c.id, c.code, c.name, c.slug, c.description,
  c.banner_img AS bannerImg, c.accent_hue AS accentHue,
  c.sort_order AS sortOrder, c.is_active AS isActive
`;

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);

export async function listCategories(req, res) {
  const includeInactive = req.query.includeInactive === '1' && req.user?.role === 'admin';
  const isStaff = req.user?.role === 'admin' || req.user?.role === 'moderator';

  const where = includeInactive || isStaff ? '' : 'WHERE c.is_active = 1';

  const rows = await query(
    `SELECT ${CATEGORY_FIELDS}, COUNT(p.id) AS postCount
       FROM categories c
       LEFT JOIN posts p ON p.category_id = c.id AND p.status = 'published'
       ${where}
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC`
  );

  res.json(rows);
}

export async function getCategory(req, res) {
  const { codeOrSlug } = req.validated.params;

  const [category] = await query(
    `SELECT ${CATEGORY_FIELDS}, COUNT(p.id) AS postCount
       FROM categories c
       LEFT JOIN posts p ON p.category_id = c.id AND p.status = 'published'
      WHERE c.code = ? OR c.slug = ?
      GROUP BY c.id
      LIMIT 1`,
    [codeOrSlug, codeOrSlug]
  );

  if (!category) throw ApiError.notFound('Category not found!');
  res.json(category);
}

export async function createCategory(req, res) {
  const { code, name, slug, description, bannerImg, accentHue, sortOrder, isActive } =
    req.validated.body;

  const finalSlug = slug || slugify(name);

  const clash = await query(
    'SELECT id FROM categories WHERE code = ? OR slug = ? LIMIT 1',
    [code, finalSlug]
  );
  if (clash.length) throw ApiError.conflict('A category with that code or slug already exists.');

  const result = await query(
    `INSERT INTO categories (code, name, slug, description, banner_img, accent_hue, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [code, name, finalSlug, description || null, bannerImg || null, accentHue, sortOrder, isActive ? 1 : 0]
  );

  const [category] = await query(`SELECT ${CATEGORY_FIELDS} FROM categories c WHERE c.id = ?`, [
    result.insertId,
  ]);
  res.status(201).json(category);
}

export async function updateCategory(req, res) {
  const { id } = req.validated.params;
  const body = req.validated.body;

  const [existing] = await query('SELECT id FROM categories WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Category not found!');

  const map = {
    name: 'name',
    slug: 'slug',
    description: 'description',
    bannerImg: 'banner_img',
    accentHue: 'accent_hue',
    sortOrder: 'sort_order',
    isActive: 'is_active',
  };

  const fields = [];
  const params = [];
  for (const [key, column] of Object.entries(map)) {
    if (body[key] !== undefined) {
      fields.push(`${column} = ?`);
      params.push(key === 'isActive' ? (body[key] ? 1 : 0) : body[key] ?? null);
    }
  }

  if (!fields.length) throw ApiError.badRequest('Nothing to update.');

  await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);

  const [category] = await query(`SELECT ${CATEGORY_FIELDS} FROM categories c WHERE c.id = ?`, [id]);
  res.json(category);
}

export async function deleteCategory(req, res) {
  const { id } = req.validated.params;

  const [existing] = await query('SELECT id, code FROM categories WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Category not found!');

  const [{ total }] = await query('SELECT COUNT(*) AS total FROM posts WHERE category_id = ?', [id]);
  if (total > 0) {
    throw new ApiError(
      409,
      `That category still has ${total} post(s). Move them to another category first.`,
      'CATEGORY_IN_USE'
    );
  }

  await query('DELETE FROM categories WHERE id = ?', [id]);
  res.json({ message: 'Category deleted.', id });
}
