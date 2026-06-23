import express from "express";
import {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  toggleDealStatus,
  deleteDeal,
} from "../controllers/dealsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/",                        authMiddleware, isAdmin, getAllDeals);
router.get("/:dealId",                 authMiddleware, isAdmin, getDealById);
router.post("/create",                 authMiddleware, isAdmin, createDeal);
router.patch("/update/:dealId",        authMiddleware, isAdmin, updateDeal);
router.patch("/toggle-status/:dealId", authMiddleware, isAdmin, toggleDealStatus);
router.delete("/delete/:dealId",       authMiddleware, isAdmin, deleteDeal);

export default router;