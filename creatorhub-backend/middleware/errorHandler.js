// middleware/errorHandler.js
// ─────────────────────────────────────────────
//  Global error handler — catches all errors
//  thrown anywhere in route handlers.
// ─────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 Error:', err);
  }

  // SQLite unique constraint (duplicate email, etc.)
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    const field = err.message.split('.')[1];
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`
    });
  }

  // SQLite foreign key error
  if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.'
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Helper: create a structured error quickly
// Usage: throw createError('Not found', 404)
const createError = (message, statusCode = 500) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, createError };
