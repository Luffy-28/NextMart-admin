import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  refunds: [],
  counts: {
    pending: 0,
    approved: 0,
    partial: 0,
    rejected: 0,
  },
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

const refundSlice = createSlice({
  name: "refund",
  initialState,
  reducers: {
    setRefunds: (state, action) => {
      state.refunds = action.payload;
    },
    setCounts: (state, action) => {
      state.counts = action.payload;
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
    updateRefundInList: (state, action) => {
      const updated = action.payload;
      const index = state.refunds.findIndex((r) => r._id === updated._id);
      if (index !== -1) {
        state.refunds[index] = updated;
      }
    },
  },
});

export const {
  setRefunds,
  setCounts,
  setLoading,
  setError,
  setPagination,
  updateRefundInList,
} = refundSlice.actions;

export default refundSlice.reducer;
