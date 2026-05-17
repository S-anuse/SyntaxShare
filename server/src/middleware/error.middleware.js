/**
 * Global error handling middleware.
 * Express identifies error handlers by their 4-parameter signature (err, req, res, next).
 * All errors passed via next(err) land here.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const isDev = process.env.NODE_ENV === 'development';

  // Mongoose duplicate key error (e.g., duplicate email or username)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      message: `An account with that ${field} already exists.`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    // Expose stack trace only in development
    ...(isDev && { stack: err.stack }),
  });
};
