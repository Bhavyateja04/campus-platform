// Authorization middleware: requires that req.user (set by authMiddleware) has role === "admin".
// MUST be chained AFTER the JWT-verifying authMiddleware/protect middleware.
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = adminOnly;
