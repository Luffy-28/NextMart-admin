import express from "express";
import {
    getAllOrder,
    getOrderDetails,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// GET  /api/v1/orders                      — paginated list of all orders
router.get("/", authMiddleware, isAdmin, getAllOrder);

// PATCH /api/v1/orders/update-status/:orderId  — update order status + send email
// NOTE: this must come BEFORE /:orderId so Express doesn't match "update-status" as an ID
router.patch("/update-status/:orderId", authMiddleware, isAdmin, updateOrderStatus);

// GET  /api/v1/orders/:orderId             — single order with full details
router.get("/:orderId", authMiddleware, isAdmin, getOrderDetails);

export default router;
