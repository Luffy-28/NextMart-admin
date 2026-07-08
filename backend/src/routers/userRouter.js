import express from "express";
import {
  getUserDetail,
  updateAdminProfile,
  requestPhoneVerification,
  verifyPhoneOtp,
  toggleTwoFactor,
  getSecurityLogs,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getUserDetail);
router.patch("/profile", authMiddleware, updateAdminProfile);


export default router;
