import { verifyToken } from "../helpers/tokenHelper.js";
import { Admin } from "../models/adminUserModel.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).send({ status: "error", message: "No token" });
    }
    const token = authHeader.split(" ")[1];

    if (token) {
      const tokenData = verifyToken(token);

      const user = await Admin.findOne({ email: tokenData.email });
      const { password, ...safeUser } = user.toObject();
      if (user) {
        req.user = safeUser;
        next();
      } else {
        return res.status(401).send({
          status: "error",
          message: "Invalid User",
        });
      }
    } else {
      return res.status(401).send({
        status: "error",
        message: "No token",
      });
    }
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        status: "error",
        message: "jwt expired",
      });
    }
    return res.status(401).send({
      status: "error",
      message: "Unauthorized access",
    });
  }
};
