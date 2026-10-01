import { fetchReviewsApi, approveReviewApi, rejectReviewApi, banUserApi } from "./reviewApis";
import { setReviews, setLoading, setError, setCounts, removeReviewFromList } from "./reviewSlice";

// Fetch reviews by status — called whenever the admin switches tabs
export const fetchReviews = (status = "pending") => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const response = await fetchReviewsApi(status);
        if (response.status === "success") {
            dispatch(setReviews(response.reviews));
            dispatch(setCounts(response.counts));
        } else {
            dispatch(setError(response.message || "Failed to fetch reviews"));
        }
    } catch (error) {
        dispatch(setError("Failed to fetch reviews"));
    } finally {
        dispatch(setLoading(false));
    }
};

// Approve a review — removes it from the current list and refreshes counts
export const approveReview = (reviewId, currentTab) => async (dispatch) => {
    try {
        const response = await approveReviewApi(reviewId);
        if (response.status === "success") {
            dispatch(removeReviewFromList(reviewId));
            // Refresh the counts by re-fetching (avoids manual count math)
            dispatch(fetchReviews(currentTab));
            return true;
        }
        return false;
    } catch (error) {
        dispatch(setError("Failed to approve review"));
        return false;
    }
};

// Reject a review — removes it from the current list and refreshes counts
export const rejectReview = (reviewId, currentTab) => async (dispatch) => {
    try {
        const response = await rejectReviewApi(reviewId);
        if (response.status === "success") {
            dispatch(removeReviewFromList(reviewId));
            dispatch(fetchReviews(currentTab));
            return true;
        }
        return false;
    } catch (error) {
        dispatch(setError("Failed to reject review"));
        return false;
    }
};

// Ban user — rejects the review AND blocks the user account
export const banUser = (reviewId, reason, currentTab) => async (dispatch) => {
    try {
        const response = await banUserApi(reviewId, reason);
        if (response.status === "success") {
            dispatch(removeReviewFromList(reviewId));
            dispatch(fetchReviews(currentTab));
            return true;
        }
        return false;
    } catch (error) {
        dispatch(setError("Failed to ban user"));
        return false;
    }
};
