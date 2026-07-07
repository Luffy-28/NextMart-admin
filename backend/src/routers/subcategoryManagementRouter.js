import express from "express";
import {
  getAllSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  toggleSubCategoryStatus,
  deleteSubCategory,
  uploadSubCategoryImageHandler,
} from "../controllers/subCategorycontroller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import { uploadSubCategoryImage, handleMulterError } from "../middlewares/multerConfig.js";

const router = express.Router();

// ─── Image upload (single file, field name: "image") ──────────────────────────
router.post(
  "/upload-image",
  authMiddleware,
  isAdmin,
  uploadSubCategoryImage.single("image"),
  handleMulterError,
  uploadSubCategoryImageHandler
);

// ─── Standard CRUD ────────────────────────────────────────────────────────────
router.get("/", authMiddleware, isAdmin, getAllSubCategories);
router.get("/:subCatId", authMiddleware, isAdmin, getSubCategoryById);

// Create sub-category — supports optional multipart image upload (field: "image")
router.post(
  "/create",
  authMiddleware,
  isAdmin,
  uploadSubCategoryImage.single("image"),
  handleMulterError,
  createSubCategory
);

// Update sub-category — supports optional multipart image upload (field: "image")
router.patch(
  "/update/:subCatId",
  authMiddleware,
  isAdmin,
  uploadSubCategoryImage.single("image"),
  handleMulterError,
  updateSubCategory
);

router.patch("/toggle-status/:subCatId", authMiddleware, isAdmin, toggleSubCategoryStatus);
router.delete("/delete/:subCatId", authMiddleware, isAdmin, deleteSubCategory);

export default router;