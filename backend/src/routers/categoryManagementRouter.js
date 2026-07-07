import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  updateCategory,
  uploadCategoryImageHandler,
} from "../controllers/categoryController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import { uploadCategoryImage, handleMulterError } from "../middlewares/multerConfig.js";

const router = express.Router();

// ─── Image upload (single file, field name: "image") ──────────────────────────
router.post(
  "/upload-image",
  authMiddleware,
  isAdmin,
  uploadCategoryImage.single("image"),
  handleMulterError,
  uploadCategoryImageHandler
);

// ─── Standard CRUD ────────────────────────────────────────────────────────────
// Create category — supports optional multipart image upload (field: "image")
router.post(
  "/create",
  authMiddleware,
  isAdmin,
  uploadCategoryImage.single("image"),
  handleMulterError,
  createCategory
);

router.get("/", authMiddleware, isAdmin, getAllCategory);

// Update category — supports optional multipart image upload (field: "image")
router.patch(
  "/update/:catId",
  authMiddleware,
  isAdmin,
  uploadCategoryImage.single("image"),
  handleMulterError,
  updateCategory
);

router.delete("/delete/:catId", authMiddleware, isAdmin, deleteCategory);

export default router;
