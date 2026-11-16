const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/apiResponse');

// This middleware runs BEFORE any protected route
// It checks if the request has a valid JWT token
// If no token or invalid token -- request is blocked immediately

const authenticate = (req, res, next) => {

  // Every protected request must send a header like this:
  // Authorization: Bearer eyJhbGci...
  const authHeader = req.headers.authorization;

  // Check if header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided. Please log in.', 401));
  }

  // Extract just the token part after "Bearer "
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using our secret key from .env
    // If token is fake or expired, this will throw an error
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach the decoded user info to the request object
    // Now every controller can access req.user to know who is logged in
    req.user = decoded;

    // Move to the next middleware or controller
    next();

  } catch (err) {
    // Token has expired -- user needs to log in again
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401));
    }
    // Token is invalid or tampered with
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
};

module.exports = { authenticate };