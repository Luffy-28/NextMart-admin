import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orders: [],
    loading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10,
    },
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setOrders: (state, action) => {
            state.orders = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setPagination: (state, action) => {
            state.pagination = action.payload;
        },
        // Update a single order's status in the list without re-fetching everything
        updateOrderInList: (state, action) => {
            const updated = action.payload;
            const index = state.orders.findIndex((o) => o._id === updated._id);
            if (index !== -1) {
                state.orders[index] = updated;
            }
        },
    },
});

export const { setOrders, setLoading, setError, setPagination, updateOrderInList } = orderSlice.actions;
export default orderSlice.reducer;
