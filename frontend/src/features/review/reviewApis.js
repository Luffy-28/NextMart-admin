import { apiProcessor } from "../../helpers/axiosHelper";

const BASE = import.meta.env.VITE_ROOT_URL;

// Fetch all reviews filtered by status (pending | approved | rejected)
export const fetchReviewsApi = async (status = "pending") => {
    return apiProcessor({
        url: `${BASE}/api/v1/review?status=${status}&limit=50`,
        method: "GET",
        isPrivate: true,
    });
};

// Approve a review — it becomes visible on the customer product page
export const approveReviewApi = async (reviewId) => {
    return apiProcessor({
        url: `${BASE}/api/v1/review/approve/${reviewId}`,
        method: "PATCH",
        isPrivate: true,
    });
};

// Reject a review — it stays hidden from the customer product page
export const rejectReviewApi = async (reviewId) => {
    return apiProcessor({
        url: `${BASE}/api/v1/review/reject/${reviewId}`,
        method: "PATCH",
        isPrivate: true,
    });
};

// Ban user — rejects the review AND blocks the user account
export const banUserApi = async (reviewId, reason) => {
    return apiProcessor({
        url: `${BASE}/api/v1/review/ban/${reviewId}`,
        method: "PATCH",
        isPrivate: true,
        data: { reason },
    });
};
