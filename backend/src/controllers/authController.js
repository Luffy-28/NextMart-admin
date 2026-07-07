import { compareData, hashPassword } from "../helpers/encryptHelper.js";
import { signToken, signRefreshToken, verifyRefreshToken } from "../helpers/tokenHelper.js";
import { Admin } from "../models/adminUserModel.js";

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
    const userData = await Admin.findOne({ email });
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
        const refreshToken = signRefreshToken(payload);

        const { password, ...safeUser } = userData.toObject();
        return res.status(200).send({
          status: "success",
          message: "User logged in successfully",
          data: safeUser,
          accessToken,
          refreshToken,
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

export const refreshAccessToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).send({ status: "error", message: "No token" });
    }
    const refreshToken = authHeader.split(" ")[1];
    if (!refreshToken) {
      return res.status(401).send({ status: "error", message: "No token" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await Admin.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).send({ status: "error", message: "Invalid User" });
    }

    const payload = { email: user.email };
    const accessToken = signToken(payload);

    return res.status(200).send({
      status: "success",
      accessToken,
    });
  } catch (error) {
    console.log("refreshAccessToken error:", error);
    return res.status(401).send({
      status: "error",
      message: "Invalid or expired refresh token",
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

