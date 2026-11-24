import express from 'express';
import {
  acceptAnswer,
  answerQuestion,
  createQuestion,
  deleteAnswer,
  deleteQuestion,
  getQuestion,
  listQuestions,
  questionStats,
} from '../controllers/qa.js';
import { optionalAuth, requireAuth } from '../middleware/requireAuth.js';
import { requireActive } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  acceptAnswerSchema,
  answerParamSchema,
  createAnswerSchema,
  createQuestionSchema,
  idParamSchema,
  listQuestionsQuerySchema,
} from '../schemas.js';

const router = express.Router();

// Must be declared before '/:id', otherwise "stats" would be matched as an id.
router.get('/stats', asyncHandler(questionStats));

router.get(
  '/',
  optionalAuth,
  validate({ query: listQuestionsQuerySchema }),
  asyncHandler(listQuestions)
);

router.get('/:id', optionalAuth, validate({ params: idParamSchema }), asyncHandler(getQuestion));

router.post(
  '/',
  requireAuth,
  requireActive,
  validate({ body: createQuestionSchema }),
  asyncHandler(createQuestion)
);

router.post(
  '/:id/answers',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema, body: createAnswerSchema }),
  asyncHandler(answerQuestion)
);

router.patch(
  '/:id/accept',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema, body: acceptAnswerSchema }),
  asyncHandler(acceptAnswer)
);

router.delete(
  '/:id/answers/:answerId',
  requireAuth,
  requireActive,
  validate({ params: answerParamSchema }),
  asyncHandler(deleteAnswer)
);

router.delete(
  '/:id',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema }),
  asyncHandler(deleteQuestion)
);

export default router;
