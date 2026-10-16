
//to eliminate try catch in each field
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let status = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === 'CastError') { status = 400; message = 'Invalid ID'; }
  if (err.code === 11000) { status = 400; message = 'Duplicate value: already exists'; }
  if (err.name === 'ValidationError') { status = 400; }

  res.status(status).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
