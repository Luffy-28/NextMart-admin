import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customers: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCustomers: (state, action) => {
      state.customers = action.payload.users || [];
      state.pagination = action.payload.pagination || initialState.pagination;
      state.loading = false;
      state.error = null;
    },
    updateCustomerStatusInState: (state, action) => {
      const { id, status, reason } = action.payload;
      state.customers = state.customers.map((c) =>
        c._id === id || c.id === id ? { ...c, status, reason } : c
      );
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setCustomers, updateCustomerStatusInState, setError } = customerSlice.actions;
export default customerSlice.reducer;
