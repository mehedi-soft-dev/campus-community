import { ApiError } from '../utils/ApiError.js';

// Validates and coerces req.body / req.query / req.params against zod schemas.
// Results land on req.validated rather than overwriting req.query, which is a
// getter-only property on the Express request prototype.
export const validate = (schemas) => (req, res, next) => {
  const validated = {};
  const fields = [];

  for (const [source, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[source]);
    if (result.success) {
      validated[source] = result.data;
    } else {
      for (const issue of result.error.issues) {
        fields.push({ path: issue.path.join('.'), message: issue.message });
      }
    }
  }

  if (fields.length) {
    return next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', { fields }));
  }

  req.validated = Object.assign(req.validated ?? {}, validated);
  return next();
};
