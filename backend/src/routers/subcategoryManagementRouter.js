import express from "express";
import {
  getAllSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  toggleSubCategoryStatus,
  deleteSubCategory,
} from "../controllers/subCategorycontroller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/",                            authMiddleware, isAdmin, getAllSubCategories);
router.get("/:subCatId",                   authMiddleware, isAdmin, getSubCategoryById);
router.post("/create",                     authMiddleware, isAdmin, createSubCategory);
router.patch("/update/:subCatId",          authMiddleware, isAdmin, updateSubCategory);
router.patch("/toggle-status/:subCatId",   authMiddleware, isAdmin, toggleSubCategoryStatus);
router.delete("/delete/:subCatId",         authMiddleware, isAdmin, deleteSubCategory);

export default router;