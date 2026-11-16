// Without this, you would need to write try/catch in EVERY controller
// like this -- which gets very repetitive:
//
// const login = async (req, res) => {
//   try {
//     ...your code
//   } catch (err) {
//     next(err)
//   }
// }
//
// Instead, just wrap your controller with asyncHandler and
// errors are caught automatically. Clean and simple.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;