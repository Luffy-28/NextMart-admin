import express from "express";
import { createCategory, deleteCategory, getAllCategory, updateCategory } from "../controllers/categoryController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
const router = express.Router();


router.post("/create", authMiddleware, isAdmin, createCategory);
router.get("/", authMiddleware, isAdmin, getAllCategory);
router.patch("/update/:id", authMiddleware, isAdmin, updateCategory);
router.patch("/delete/:id", authMiddleware, isAdmin, deleteCategory);

export default router;