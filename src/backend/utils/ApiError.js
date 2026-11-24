export class ApiError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, code, details) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = 'Not authenticated!') {
    return new ApiError(401, message, 'UNAUTHENTICATED');
  }

  static forbidden(message = 'Not authorized!') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Not found!') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message) {
    return new ApiError(409, message, 'CONFLICT');
  }
}
