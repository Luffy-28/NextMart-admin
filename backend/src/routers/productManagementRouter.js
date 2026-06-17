import express from "express";
import { createNewProduct, deleteProduct, getAllProduct, getProductById, updateProduct, updateStatus, updateStock } from "../controllers/productController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {isAdmin} from "../middlewares/roleMiddleware.js"
const router = express.Router();


router.get("/all-products",authMiddleware,isAdmin,getAllProduct);
router.post("/create-product",authMiddleware,isAdmin,createNewProduct);
router.get("/:id",authMiddleware,isAdmin, getProductById);
router.patch("/update-product/:id",authMiddleware,isAdmin, updateProduct);
router.patch("/update-stock/:id",authMiddleware,isAdmin,updateStock)
router.patch("/update-status/:id",authMiddleware,isAdmin,updateStatus)
router.delete("/delete-product/:id",authMiddleware,isAdmin,deleteProduct)



export default router;




