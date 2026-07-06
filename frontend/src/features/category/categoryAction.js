import {
  fetchAllCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "./categoryApis";
import { setCategories, setLoading, setError } from "./categorySlice";

// fetch all categories
export const fetchAllCategories = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetchAllCategoriesApi(1, 100, "");
    if (response.status === "success") {
      dispatch(setCategories(response.category)); // backend returns 'category' key
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};

// create category
export const createCategory = (categoryData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await createCategoryApi(categoryData);
    if (response.status === "success") {
      dispatch(fetchAllCategories()); // refresh list
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
      dispatch(fetchAllCategories()); // refresh list
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
      dispatch(fetchAllCategories()); // refresh list
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};
