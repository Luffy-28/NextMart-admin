import express from "express";
import {
  createNewProduct,
  deleteProduct,
  getAllProduct,
  getProductById,
  updateProduct,
  updateStatus,
  updateStock,
  uploadProductImageHandler,
} from "../controllers/productController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import { uploadProductImages, handleMulterError } from "../middlewares/multerConfig.js";

const router = express.Router();

// ─── Image upload (single file, field name: "image") ──────────────────────────
router.post(
  "/upload-image",
  authMiddleware,
  isAdmin,
  uploadProductImages.single("image"),
  handleMulterError,
  uploadProductImageHandler
);

// ─── Standard CRUD ────────────────────────────────────────────────────────────
router.get("/all-products", authMiddleware, isAdmin, getAllProduct);

// Create product — supports optional multipart image upload (field: "image")
router.post(
  "/create-product",
  authMiddleware,
  isAdmin,
  uploadProductImages.single("image"),
  handleMulterError,
  createNewProduct
);

router.get("/:productId", authMiddleware, isAdmin, getProductById);

// Update product — supports optional multipart image upload (field: "image")
router.patch(
  "/update-product/:productId",
  authMiddleware,
  isAdmin,
  uploadProductImages.single("image"),
  handleMulterError,
  updateProduct
);

router.patch("/update-stock/:productId", authMiddleware, isAdmin, updateStock);
router.patch("/update-status/:productId", authMiddleware, isAdmin, updateStatus);
router.delete("/delete-product/:productId", authMiddleware, isAdmin, deleteProduct);

export default router;
