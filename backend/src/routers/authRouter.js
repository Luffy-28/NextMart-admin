import express from "express";
import { loginUser, refreshAccessToken, verifyLogin2FA } from "../controllers/authController.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { loginAdminValidator } from "../middlewares/requestValidator.js";

const router = express.Router();

router.post("/login", authLimiter, loginUser);
router.post("/verify-2fa", verifyLogin2FA);
router.get("/refresh", refreshAccessToken);


export default router;
