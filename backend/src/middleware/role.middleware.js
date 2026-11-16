// This middleware checks if the logged in user has the correct role
// It always runs AFTER auth.middleware.js
// Because first we check if they are logged in, then we check their role

// It is a factory function -- meaning it returns a middleware function
// This lets us use it like this:
// requireRole('admin')         -- only admins allowed
// requireRole('student')       -- only students allowed
// requireRole('admin','student')-- both allowed

const requireRole = (...roles) => {
  return (req, res, next) => {

    // If somehow authenticate middleware was skipped
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in.',
      });
    }

    // Check if the logged in user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        // 403 means Forbidden -- you are logged in but not allowed
        message: `Access denied. Only ${roles.join(' or ')} can do this.`,
      });
    }

    // Role is valid -- move to the controller
    next();
  };
};

module.exports = { requireRole };