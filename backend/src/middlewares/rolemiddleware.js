export const isAdmin = (req, res, next) => {
  try {
    // req.user is populated by the authMiddleware before this runs
    if (!req.user) {
      return res.status(401).send({
        status: "error",
        message: "User not authenticated. Please log in first.",
      });
    }

    // Check if the authenticated user has the 'admin' role
    if (req.user.role !== "admin") {
      return res.status(403).send({
        status: "error",
        message: "Access Denied: You do not have admin privileges.",
      });
    }

    // User is admin, proceed to the controller
    next();
  } catch (error) {
    console.error("Role authorization error:", error);
    return res.status(500).send({
      status: "error",
      message: "Server error during authorization check.",
    });
  }
};
