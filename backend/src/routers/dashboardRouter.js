import express from "express";
import {
  getDashboardStats,
  getRevenueOverTime,
  getBestSellingProducts,
  getLatestOrders,
} from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();


router.get("/stats",         authMiddleware, isAdmin, getDashboardStats);
router.get("/revenue",       authMiddleware, isAdmin, getRevenueOverTime);
router.get("/best-selling",  authMiddleware, isAdmin, getBestSellingProducts);
router.get("/recent-orders", authMiddleware, isAdmin, getLatestOrders);

export default router;