import express from "express";
import { getUserDetail } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express();

router.get("/", authMiddleware, getUserDetail);

export default router;
