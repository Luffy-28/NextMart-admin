import express from "express";
import { getAllApprovedReviews, getReviewById, rejectReview, updateReviewStatus } from "../controllers/ReviewController.js";

const router = express.Router();



router.get("/", getAllApprovedReviews)
router.get("/:id", getReviewById)
router.patch("/approve/:id", updateReviewStatus)
router.patch("/reject/:id", rejectReview)


export default router;