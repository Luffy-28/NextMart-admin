import express from "express";
import { loginUser } from "../controllers/userController.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { loginAdminValidator } from "../middlewares/requestValidator.js";

const router = express.Router();

router.post("/login", authLimiter, loginAdminValidator, loginUser);

export default router;
