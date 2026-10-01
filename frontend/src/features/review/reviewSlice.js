import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    reviews: [],
    loading: false,
    error: null,
    // Counts for all 3 tabs — so badges stay accurate even when you switch tabs
    counts: {
        pending: 0,
        approved: 0,
        rejected: 0,
    },
};

const reviewSlice = createSlice({
    name: "review",
    initialState,
    reducers: {
        setReviews: (state, action) => {
            state.reviews = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setCounts: (state, action) => {
            state.counts = action.payload;
        },
        // Remove a review from the current list after approve / reject / ban
        removeReviewFromList: (state, action) => {
            state.reviews = state.reviews.filter((r) => r._id !== action.payload);
        },
    },
});

export const { setReviews, setLoading, setError, setCounts, removeReviewFromList } = reviewSlice.actions;
export default reviewSlice.reducer;
