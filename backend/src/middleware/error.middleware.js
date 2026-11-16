const { AppError } = require('../utils/apiResponse');

// This is the GLOBAL error handler
// Any error thrown anywhere in the entire app ends up here
// Express recognizes it as an error handler because it has 4 parameters
// (err, req, res, next) -- this is an Express rule, never remove any of them

const errorHandler = (err, req, res, next) => {

  // Default values if not specified
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // If it is our own AppError, use it directly
  // If it is an unknown system error, hide the details from the user
  if (!err.isOperational) {
    message = 'Something went wrong. Please try again.';
    statusCode = 500;
  }

  // In development, log the full error in terminal so you can debug
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 ERROR:', err);
  }

  // Send the error response back to the user
  return res.status(statusCode).json({
    success: false,
    message,
    // Only show error stack trace in development, never in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };