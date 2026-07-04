import express from "express";
import { loginUser } from "../controllers/authController.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { loginAdminValidator } from "../middlewares/requestValidator.js";

const router = express.Router();

router.post("/login", authLimiter , loginUser);

export default router;
