import { compareData, hashPassword } from "../helpers/encryptHelper.js";
import { signToken, signRefreshToken, verifyRefreshToken } from "../helpers/tokenHelper.js";
import { Admin } from "../models/adminUserModel.js";
import { SecurityLog } from "../models/securityLogModel.js";
import { sendWhatsAppMessage } from "../helpers/whatsappClient.js";
import { logSecurityEvent } from "../helpers/securityLogger.js";


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

        const { password: pass, ...safeUser } = userData.toObject();

        await logSecurityEvent(userData._id, userData.name, "Login Success", "Successfully authenticated with email and password", req);

        return res.status(200).send({
          status: "success",
          message: "User logged in successfully",
          data: safeUser,
          accessToken,
          refreshToken,
        });
      } else {
        // Log failed password attempt
        await logSecurityEvent(userData._id, userData.name, "Login Failed", "Failed authentication: Invalid password entered", req);
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

export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { name, email, image, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (image !== undefined) updateData.image = image;
    if (password) {
      updateData.password = hashPassword(password);
    }

    if (email && email !== req.user.email) {
      const existing = await Admin.findOne({ email });
      if (existing) {
        return res.status(400).send({
          status: "error",
          message: "Email is already in use by another account",
        });
      }
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, { new: true }).select("-password -__v");
    if (!updatedAdmin) {
      return res.status(404).send({
        status: "error",
        message: "Admin not found",
      });
    }

    // Log the profile update event
    let updateFields = [];
    if (name) updateFields.push("name");
    if (email) updateFields.push("email");
    if (image) updateFields.push("avatar");
    if (password) updateFields.push("password");
    await logSecurityEvent(updatedAdmin._id, updatedAdmin.name, "Profile Updated", `Updated fields: ${updateFields.join(", ")}`, req);

    return res.status(200).send({
      status: "success",
      message: "Profile updated successfully",
      user: updatedAdmin,
    });
  } catch (error) {
    console.log("updateAdminProfile error:", error);
    return res.status(500).send({
      status: "error",
      message: "Error updating profile details",
    });
  }
};

// Retrieve Audit Logs
export const getSecurityLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.find({ adminId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(100);

    return res.status(200).send({
      status: "success",
      logs,
    });
  } catch (error) {
    console.log("getSecurityLogs error:", error);
    return res.status(500).send({
      status: "error",
      message: "Error fetching security audit logs",
    });
  }
};



