import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  subCategories: [],
  allSubCategories: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  },
};

const subCategorySlice = createSlice({
  name: "subCategory",
  initialState,
  reducers: {
    setSubCategories: (state, action) => {
      state.subCategories = action.payload;
    },
    setAllSubCategories: (state, action) => {
      state.allSubCategories = action.payload;
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

export const {
  setSubCategories,
  setAllSubCategories,
  setLoading,
  setError,
  setPagination,
} = subCategorySlice.actions;

export default subCategorySlice.reducer;
