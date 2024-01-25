const User = require("../models/UserSchema");
const isAuthenticated = (req, res, next) => {
  const authenticatedUserId = req.user.user._id;

  // Try to get userId from query, params, and body
  const requestedUserId =
    req.query.userId || req.params.userId || req.body.userId;

  // If userId is not present in any of the sources, or if it doesn't match the authenticated user's ID
  if (!requestedUserId || authenticatedUserId !== requestedUserId) {
    return res.status(403).json({
      message: "Unauthorized: You are not allowed to access this resource",
    });
  }
  next();
};

module.exports = {
  isAuthenticated,
};
