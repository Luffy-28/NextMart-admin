import express from "express";
import { getAllRefundRequests, processRefundRequest } from "../controllers/refundController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// GET  /api/v1/refunds?status=pending  — list all refund requests by status
router.get("/", authMiddleware, isAdmin, getAllRefundRequests);

// PATCH /api/v1/refunds/process/:requestId — approve full, partial, or reject
router.patch("/process/:requestId", authMiddleware, isAdmin, processRefundRequest);

export default router;
