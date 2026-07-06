import {
  fetchAllCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "./categoryApis";
import { setCategories, setAllCategories, setLoading, setError, setPagination } from "./categorySlice";

// fetch all categories (paginated for list)
export const fetchAllCategories = (page = 1, limit = 5, search = "") => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetchAllCategoriesApi(page, limit, search);
    if (response.status === "success") {
      dispatch(setCategories(response.category)); // backend returns 'category' key
      dispatch(setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total,
        limit: response.pagination.limit,
      }));
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};

// fetch all categories (unpaginated for dropdowns)
export const fetchAllCategoriesList = () => async (dispatch) => {
  try {
    const response = await fetchAllCategoriesApi(1, 1000, "");
    if (response.status === "success") {
      dispatch(setAllCategories(response.category));
      return response;
    }
  } catch (error) {
    console.log("fetchAllCategoriesList error:", error);
  }
};

// create category
export const createCategory = (categoryData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await createCategoryApi(categoryData);
    if (response.status === "success") {
      dispatch(fetchAllCategories()); // refresh paginated list
      dispatch(fetchAllCategoriesList()); // refresh dropdowns
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};

// update category
export const updateCategory = (catId, updateData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await updateCategoryApi(catId, updateData);
    if (response.status === "success") {
      dispatch(fetchAllCategories()); // refresh paginated list
      dispatch(fetchAllCategoriesList()); // refresh dropdowns
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};

// delete category
export const deleteCategory = (catId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await deleteCategoryApi(catId);
    if (response.status === "success") {
      dispatch(fetchAllCategories()); // refresh paginated list
      dispatch(fetchAllCategoriesList()); // refresh dropdowns
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};
