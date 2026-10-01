import { Review } from "../models/reviewModel.js";
import { User } from "../models/userModel.js";

// Get all reviews — filtered by status (pending / approved / rejected)
export const getAllReviews = async (req, res) => {
    try {
        const { status = "pending", page = 1, limit = 20 } = req.query;
        const pageNum  = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build filter — if status is one of the 3 valid values, filter by it
        const filter = {};
        if (["pending", "approved", "rejected"].includes(status)) {
            filter.isApproved = status;
        }

        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .populate("user", "name email image status")
                .populate("product", "name images")
                .populate("order", "orderNumber")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            Review.countDocuments(filter),
        ]);

        // Also send counts for all statuses so the tab badges stay accurate
        const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
            Review.countDocuments({ isApproved: "pending" }),
            Review.countDocuments({ isApproved: "approved" }),
            Review.countDocuments({ isApproved: "rejected" }),
        ]);

        return res.status(200).send({
            status: "success",
            message: "Reviews fetched successfully",
            reviews,
            counts: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: "error", message: "Failed to get reviews" });
    }
};

// Approve a review — it will now show on the product detail page
export const approveReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndUpdate(
            id,
            { isApproved: "approved" },
            { new: true }
        );
        if (!review) {
            return res.status(404).send({ status: "error", message: "Review not found" });
        }
        return res.status(200).send({ status: "success", message: "Review approved", review });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: "error", message: "Failed to approve review" });
    }
};

// Reject a review — it will NOT show on the product detail page
export const rejectReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndUpdate(
            id,
            { isApproved: "rejected" },
            { new: true }
        );
        if (!review) {
            return res.status(404).send({ status: "error", message: "Review not found" });
        }
        return res.status(200).send({ status: "success", message: "Review rejected", review });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: "error", message: "Failed to reject review" });
    }
};

// Ban user — rejects the review AND blocks the user account in one action.
// The admin provides a reason which is saved on the user record.
export const banUserFromReview = async (req, res) => {
    try {
        const { id } = req.params;                          // review id
        const { reason = "Violation of terms and conditions" } = req.body;

        // Find the review so we know which user to ban
        const review = await Review.findById(id).populate("user", "_id");
        if (!review) {
            return res.status(404).send({ status: "error", message: "Review not found" });
        }

        // Reject the review
        review.isApproved = "rejected";
        await review.save();

        // Block the user with the provided reason
        const user = await User.findByIdAndUpdate(
            review.user._id,
            { status: "block", reason },
            { new: true }
        ).select("name email status reason");

        if (!user) {
            return res.status(404).send({ status: "error", message: "User not found" });
        }

        return res.status(200).send({
            status: "success",
            message: `Review rejected and user "${user.name}" has been banned`,
            review,
            user,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: "error", message: "Failed to ban user" });
    }
};
