import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    deals: [],
    loading: false,
    error: null,
    stats: {
        totalDeals: 0,
        activeDeals: 0,
        inactiveDeals: 0,
        productsOnDeal: 0,
    },
    // All products and categories fetched for the form pickers
    allProducts: [],
    allCategories: [],
};

const dealsSlice = createSlice({
    name: "deals",
    initialState,
    reducers: {
        setDeals: (state, action) => {
            state.deals = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setStats: (state, action) => {
            state.stats = action.payload;
        },
        setAllProducts: (state, action) => {
            state.allProducts = action.payload;
        },
        setAllCategories: (state, action) => {
            state.allCategories = action.payload;
        },
        // Add new deal to the top of the list
        addDeal: (state, action) => {
            state.deals.unshift(action.payload);
            state.stats.totalDeals += 1;
            if (action.payload.isActive) state.stats.activeDeals += 1;
            else state.stats.inactiveDeals += 1;
        },
        // Update a deal in the list
        updateDealInList: (state, action) => {
            const idx = state.deals.findIndex((d) => d._id === action.payload._id);
            if (idx !== -1) state.deals[idx] = action.payload;
        },
        // Remove a deal from the list
        removeDeal: (state, action) => {
            state.deals = state.deals.filter((d) => d._id !== action.payload);
        },
    },
});

export const {
    setDeals, setLoading, setError, setStats,
    setAllProducts, setAllCategories,
    addDeal, updateDealInList, removeDeal,
} = dealsSlice.actions;

export default dealsSlice.reducer;
