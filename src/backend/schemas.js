import { z } from 'zod';

const id = z.coerce.number().int().positive('Must be a positive integer');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  // bcrypt only uses the first 72 bytes, so reject anything longer instead of
  // silently truncating it.
  .max(72, 'Password must be at most 72 characters');

// Shared list params. pageSize is clamped rather than rejected so an oversized
// value cannot be used to dump a table, but also does not 400 the request.
const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .default(12)
    .transform((value) => Math.min(value, 50)),
};

export const NOTICE_CATEGORIES = [
  'general',
  'exam',
  'admission',
  'result',
  'event',
  'scholarship',
];

export const NOTICE_PRIORITIES = ['normal', 'important', 'urgent'];
export const EVENT_KINDS = ['event', 'holiday', 'exam_week', 'deadline', 'registration', 'result'];
export const MATERIAL_TYPES = ['notes', 'slides', 'past_paper', 'syllabus', 'reference', 'other'];
export const EXAM_TYPES = ['midterm', 'final', 'quiz', 'practical'];
export const ROLES = ['user', 'moderator', 'admin'];
export const USER_STATUSES = ['pending', 'active', 'suspended'];

/* ---------------------------------- auth --------------------------------- */

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(45, 'Username must be at most 45 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Only letters, numbers, and _ . - are allowed'),
  email: z.string().trim().toLowerCase().email('Must be a valid email').max(120),
  password,
  fullName: z.string().trim().max(120).optional(),
  batch: z.string().trim().max(20).optional(),
  departmentId: id.optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(45),
  password: z.string().min(1, 'Password is required').max(72),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().max(120).nullish(),
  bio: z.string().trim().max(300).nullish(),
  batch: z.string().trim().max(20).nullish(),
  img: z.string().trim().max(255).nullish(),
  departmentId: id.nullish(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(72),
  newPassword: password,
});

/* --------------------------------- posts --------------------------------- */

export const idParamSchema = z.object({ id });

export const codeParamSchema = z.object({
  codeOrSlug: z.string().trim().min(1).max(140),
});

export const listPostsQuerySchema = z.object({
  category: z.string().trim().max(45).optional(),
  sort: z.enum(['latest', 'top']).default('latest'),
  q: z.string().trim().max(120).optional(),
  author: z.string().trim().max(45).optional(),
  ...pagination,
});

export const createPostSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  desc: z.string().trim().min(1, 'Content is required').max(50_000),
  categoryId: id,
  img: z.string().trim().max(255).nullish(),
});

export const updatePostSchema = createPostSchema;

/* ------------------------------- categories ------------------------------ */

export const createCategorySchema = z.object({
  code: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'Code must be at least 2 characters')
    .max(45)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only'),
  name: z.string().trim().min(1, 'Name is required').max(120),
  slug: z.string().trim().toLowerCase().max(140).optional(),
  description: z.string().trim().max(300).nullish(),
  bannerImg: z.string().trim().max(255).nullish(),
  accentHue: z.coerce.number().int().min(0).max(360).default(220),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial().omit({ code: true });

/* --------------------------------- notices ------------------------------- */

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  body: z.string().trim().min(1, 'Body is required').max(20_000),
  category: z.enum(NOTICE_CATEGORIES).default('general'),
  priority: z.enum(NOTICE_PRIORITIES).default('normal'),
  isPinned: z.coerce.boolean().default(false),
  attachmentId: id.nullish(),
  publishAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().nullish(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
});

export const updateNoticeSchema = createNoticeSchema.partial();

export const listNoticesQuerySchema = z.object({
  category: z.enum(NOTICE_CATEGORIES).optional(),
  includeExpired: z.coerce.boolean().optional(),
  ...pagination,
});

/* ------------------------------ exam routines ---------------------------- */

export const createRoutineSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  departmentId: id.nullish(),
  semester: z.string().trim().max(30).nullish(),
  examType: z.enum(EXAM_TYPES).default('final'),
  fileId: id,
  effectiveFrom: z.coerce.date().nullish(),
  notes: z.string().trim().max(300).nullish(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
});

export const updateRoutineSchema = createRoutineSchema.partial();

export const listRoutinesQuerySchema = z.object({
  departmentId: id.optional(),
  semester: z.string().trim().max(30).optional(),
  examType: z.enum(EXAM_TYPES).optional(),
  ...pagination,
});

/* --------------------------------- events -------------------------------- */

export const createEventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(5000).nullish(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().nullish(),
  allDay: z.coerce.boolean().default(false),
  location: z.string().trim().max(160).nullish(),
  departmentId: id.nullish(),
  kind: z.enum(EVENT_KINDS).default('event'),
  isFeatured: z.coerce.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
});

export const updateEventSchema = createEventSchema.partial();

export const listEventsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  kind: z.enum(EVENT_KINDS).optional(),
  ...pagination,
});

/* ------------------------------- materials ------------------------------- */

export const createMaterialSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(300).nullish(),
  courseCode: z.string().trim().max(20).nullish(),
  departmentId: id.nullish(),
  semester: z.string().trim().max(30).nullish(),
  materialType: z.enum(MATERIAL_TYPES).default('notes'),
  fileId: id,
});

export const listMaterialsQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  departmentId: id.optional(),
  materialType: z.enum(MATERIAL_TYPES).optional(),
  courseCode: z.string().trim().max(20).optional(),
  ...pagination,
});

/* ---------------------------- ratings / comments -------------------------- */

export const ratingSchema = z.object({
  value: z.coerce.number().int().min(1, 'Rate between 1 and 5').max(5, 'Rate between 1 and 5'),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
  parentId: id.nullish(),
});

export const updateCommentSchema = z.object({
  body: z.string().trim().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
});

export const voteSchema = z.object({
  value: z.coerce
    .number()
    .int()
    .refine((v) => v === 1 || v === -1 || v === 0, 'Vote must be 1, -1 or 0'),
});

export const listCommentsQuerySchema = z.object({
  sort: z.enum(['new', 'top']).default('new'),
  ...pagination,
});

/* ----------------------------------- Q&A --------------------------------- */

// Titles and bodies have a floor as well as a ceiling: "help?" is not a
// question anyone can answer, and a one-word answer helps nobody.
export const createQuestionSchema = z.object({
  title: z.string().trim().min(10, 'Describe the question in at least 10 characters').max(200),
  body: z.string().trim().min(10, 'Add a bit of detail so people can help').max(10_000),
  categoryId: id.nullish(),
});

export const createAnswerSchema = z.object({
  body: z.string().trim().min(2, 'Your answer is too short').max(10_000),
});

export const acceptAnswerSchema = z.object({ answerId: id });

export const answerParamSchema = z.object({ id, answerId: id });

export const listQuestionsQuerySchema = z.object({
  // 'unanswered' drives both the navbar badge and the "needs an answer" view.
  filter: z.enum(['all', 'unanswered', 'answered', 'mine']).default('all'),
  category: z.string().trim().max(45).optional(),
  q: z.string().trim().max(120).optional(),
  ...pagination,
});

/* ------------------------------ admin / mod ------------------------------ */

export const listUsersQuerySchema = z.object({
  status: z.enum(USER_STATUSES).optional(),
  role: z.enum(ROLES).optional(),
  q: z.string().trim().max(120).optional(),
  ...pagination,
});

export const updateUserSchema = z
  .object({
    status: z.enum(USER_STATUSES).optional(),
    role: z.enum(ROLES).optional(),
  })
  .refine((value) => value.status || value.role, {
    message: 'Provide a status or a role to change',
  });

export const createDepartmentSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9-]+$/, 'Uppercase letters, numbers and dashes only'),
  name: z.string().trim().min(1).max(140),
  faculty: z.string().trim().max(140).nullish(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.partial().omit({ code: true });
