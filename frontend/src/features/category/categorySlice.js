import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  allCategories: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  },
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setAllCategories: (state, action) => {
      state.allCategories = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setPagination: (state, action) => {
      state.pagination.currentPage = action.payload.currentPage;
      state.pagination.totalPages = action.payload.totalPages;
      state.pagination.totalItems = action.payload.totalItems;
      state.pagination.limit = action.payload.limit;
    },
  },
});

export const { setCategories, setAllCategories, setLoading, setError, setPagination } = categorySlice.actions;
export default categorySlice.reducer;
