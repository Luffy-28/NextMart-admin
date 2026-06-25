import express from "express";
import {
  createNewProduct,
  deleteProduct,
  getAllProduct,
  getProductById,
  updateProduct,
  updateStatus,
  updateStock,
} from "../controllers/productController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
const router = express.Router();

router.get("/all-products", authMiddleware, isAdmin, getAllProduct);
router.post("/create-product", authMiddleware, isAdmin, createNewProduct);
router.get("/:productId", authMiddleware, isAdmin, getProductById);
router.patch("/update-product/:productId", authMiddleware, isAdmin, updateProduct);
router.patch("/update-stock/:productId", authMiddleware, isAdmin, updateStock);
router.patch("/update-status/:productId", authMiddleware, isAdmin, updateStatus);
router.delete("/delete-product/:productId", authMiddleware, isAdmin, deleteProduct);

export default router;
