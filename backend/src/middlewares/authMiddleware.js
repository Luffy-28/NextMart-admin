import { verifyToken } from "../helpers/tokenHelper.js";
import { User } from "../models/userModel.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      const tokenData = verifyToken(token);

      const user = await User.findOne({ email: tokenData.email });
      if (user) {
        user.password = "";
        req.user = user;
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
    return res.status(401).send({
      status: "error",
      message: "Unauthorized access",
    });
  }
};
