import express from 'express';
import { addPost, deletePost, getPost, getPosts, updatePost } from '../controllers/post.js';
import { removeRating, setRating } from '../controllers/rating.js';
import { addComment, listComments } from '../controllers/comment.js';
import { optionalAuth, requireAuth } from '../middleware/requireAuth.js';
import { requireActive } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createCommentSchema,
  createPostSchema,
  idParamSchema,
  listCommentsQuerySchema,
  listPostsQuerySchema,
  ratingSchema,
  updatePostSchema,
} from '../schemas.js';

const router = express.Router();

// optionalAuth so the response can include the viewer's own rating and let an
// owner see their removed post.
router.get('/', optionalAuth, validate({ query: listPostsQuerySchema }), asyncHandler(getPosts));
router.get('/:id', optionalAuth, validate({ params: idParamSchema }), asyncHandler(getPost));

router.post(
  '/',
  requireAuth,
  requireActive,
  validate({ body: createPostSchema }),
  asyncHandler(addPost)
);
router.put(
  '/:id',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema, body: updatePostSchema }),
  asyncHandler(updatePost)
);
router.delete(
  '/:id',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema }),
  asyncHandler(deletePost)
);

/* ------------------------------ ratings ------------------------------ */

router.put(
  '/:id/rating',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema, body: ratingSchema }),
  asyncHandler(setRating)
);
router.delete(
  '/:id/rating',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema }),
  asyncHandler(removeRating)
);

/* ----------------------------- comments ------------------------------ */

router.get(
  '/:id/comments',
  optionalAuth,
  validate({ params: idParamSchema, query: listCommentsQuerySchema }),
  asyncHandler(listComments)
);
router.post(
  '/:id/comments',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema, body: createCommentSchema }),
  asyncHandler(addComment)
);

export default router;
