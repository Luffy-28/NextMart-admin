import {
  fetchAllSubCategoriesApi,
  getSubCategoryByIdApi,
  createSubCategoryApi,
  updateSubCategoryApi,
  toggleSubCategoryStatusApi,
  deleteSubCategoryApi,
} from "./subCategoryApi";
import {
  setSubCategories,
  setAllSubCategories,
  setLoading,
  setError,
  setPagination,
} from "./suCategorySlice";

// fetch paginated sub-categories
export const fetchAllSubCategories = (page = 1, limit = 10, search = "", categoryId = "") => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetchAllSubCategoriesApi(page, limit, search, categoryId);
    if (response.status === "success") {
      dispatch(setSubCategories(response.subCategories));
      dispatch(setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total,
        limit: response.pagination.limit,
      }));
      return response;
    }
  } catch (error) {
    console.error(error);
    dispatch(setError(error.message || "Failed to fetch sub-categories"));
  } finally {
    dispatch(setLoading(false));
  }
};

// fetch all sub-categories (unpaginated for mapping & selectors)
export const fetchAllSubCategoriesList = () => async (dispatch) => {
  try {
    const response = await fetchAllSubCategoriesApi(1, 1000, "", "");
    if (response.status === "success") {
      dispatch(setAllSubCategories(response.subCategories));
      return response;
    }
  } catch (error) {
    console.error("fetchAllSubCategoriesList error:", error);
  }
};

// get sub-category by ID
export const getSubCategoryById = (subCatId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await getSubCategoryByIdApi(subCatId);
    if (response.status === "success") {
      return response;
    }
  } catch (error) {
    console.error(error);
    dispatch(setError(error.message || "Failed to fetch sub-category details"));
  } finally {
    dispatch(setLoading(false));
  }
};

// create sub-category
export const createSubCategory = (subCategoryData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await createSubCategoryApi(subCategoryData);
    if (response.status === "success") {
      dispatch(fetchAllSubCategoriesList()); // refresh complete list
      return response;
    }
  } catch (error) {
    console.error(error);
    dispatch(setError(error.message || "Failed to create sub-category"));
  } finally {
    dispatch(setLoading(false));
  }
};

// update sub-category
export const updateSubCategory = (subCatId, updateData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await updateSubCategoryApi(subCatId, updateData);
    if (response.status === "success") {
      dispatch(fetchAllSubCategoriesList()); // refresh complete list
      return response;
    }
  } catch (error) {
    console.error(error);
    dispatch(setError(error.message || "Failed to update sub-category"));
  } finally {
    dispatch(setLoading(false));
  }
};

// toggle sub-category active status
export const toggleSubCategoryStatus = (subCatId, isActive) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await toggleSubCategoryStatusApi(subCatId, isActive);
    if (response.status === "success") {
      dispatch(fetchAllSubCategoriesList()); // refresh complete list
      return response;
    }
  } catch (error) {
    console.error(error);
    dispatch(setError(error.message || "Failed to toggle sub-category status"));
  } finally {
    dispatch(setLoading(false));
  }
};

// delete sub-category
export const deleteSubCategory = (subCatId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await deleteSubCategoryApi(subCatId);
    if (response.status === "success") {
      dispatch(fetchAllSubCategoriesList()); // refresh complete list
      return response;
    }
  } catch (error) {
    console.error(error);
    dispatch(setError(error.message || "Failed to delete sub-category"));
  } finally {
    dispatch(setLoading(false));
  }
};
