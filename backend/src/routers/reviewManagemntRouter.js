import express from "express";
import {
    getAllReviews,
    approveReview,
    rejectReview,
    banUserFromReview,
} from "../controllers/ReviewController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// GET  /api/v1/review?status=pending   — fetch reviews by status (pending/approved/rejected)
router.get("/", authMiddleware, isAdmin, getAllReviews);

// PATCH /api/v1/review/approve/:id     — approve a review (shows on product page)
router.patch("/approve/:id", authMiddleware, isAdmin, approveReview);

// PATCH /api/v1/review/reject/:id      — reject a review (hides from product page)
router.patch("/reject/:id", authMiddleware, isAdmin, rejectReview);

// PATCH /api/v1/review/ban/:id         — reject the review AND ban the user
router.patch("/ban/:id", authMiddleware, isAdmin, banUserFromReview);

export default router;