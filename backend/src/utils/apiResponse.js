// This class lets us throw errors from anywhere in the app
// Example: throw new AppError('Email already exists', 409)
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;

    // This flag helps us know it's our own error, not a system crash
    this.isOperational = true;
  }
}

// Sends a successful response in a standard format
// Every successful API response looks the same
const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Sends an error response in a standard format
const error = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = { AppError, success, error };