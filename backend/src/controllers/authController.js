import { compareData, hashPassword } from "../helpers/encryptHelper.js";
import { signToken } from "../helpers/tokenHelper.js";
import { User } from "../models/adminUserModel.js";

// login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        status: "error",
        message: "Please provide email and password",
      });
    }
    const userData = await User.findOne({ email });
    if (userData) {
      const isMatched = compareData(password, userData.password);
      if (isMatched) {
        if (userData.role !== "admin") {
          return res.status(403).send({
            status: "error",
            message: "You are not authorized to access this resource",
          });
        }

        const payload = { email: userData.email };
        const accessToken = signToken(payload);

        const { password, ...safeUser } = userData.toObject();
        return res.status(200).send({
          status: "success",
          message: "User logged in successfully",
          data: safeUser,
          accessToken,
        });
      } else {
        return res.status(400).send({
          status: "error",
          message: "Invalid email or password",
        });
      }
    } else {
      return res.status(400).send({
        status: "error",
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Error logging in User",
    });
  }
};
export const getUserDetail = async (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "User details fetched successfully",
    user: req.user,
  });
};
