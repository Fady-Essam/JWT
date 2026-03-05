// Base error factory
export const ErrorResponse = ({
  message = "Internal Server Error",
  statusCode = 500,
  details = null,
} = {}) => {
  const error = new Error(message);
  error.name = "ErrorResponse";
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

// Specific exceptions (arrow functions)
export const BadRequestException = (message = "Bad Request", details = null) =>
  ErrorResponse({ message, statusCode: 400, details });

export const ConflictException = (message = "Conflict", details = null) =>
  ErrorResponse({ message, statusCode: 409, details });

export const unauthorizedException = (
  message = "Unauthorized",
  details = null,
) => ErrorResponse({ message, statusCode: 401, details });

export const NotFoundException = (message = "Not Found", details = null) =>
  ErrorResponse({ message, statusCode: 404, details });

export const ForbiddenException = (message = "Forbidden", details = null) =>
  ErrorResponse({ message, statusCode: 403, details });

// Global error middleware
export const globalErrorHandling = (err, req, res, next) => {
  const error = err?.statusCode
    ? err
    : ErrorResponse({
        message: err?.message || "Internal Server Error",
        statusCode: err?.statusCode || 500,
      });

  if (process.env.NODE_ENV !== "test") {
    console.error("[GLOBAL_ERROR]", {
      name: error.name || "Error",
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
    });
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
    ...(process.env.NODE_ENV === "development" && err?.stack
      ? { stack: err.stack }
      : {}),
  });
};
