import { apiProcessor } from "../../helpers/axiosHelper";

const BASE = `${import.meta.env.VITE_ROOT_URL}/api/v1/sub-category`;

// fetch all sub-categories
export const fetchAllSubCategoriesApi = async (page = 1, limit = 100, search = "", categoryId = "") => {
  return apiProcessor({
    url: `${BASE}?page=${page}&limit=${limit}&search=${search}&categoryId=${categoryId}`,
    method: "GET",
    isPrivate: true,
  });
};

// get sub-category by ID
export const getSubCategoryByIdApi = async (subCatId) => {
  return apiProcessor({
    url: `${BASE}/${subCatId}`,
    method: "GET",
    isPrivate: true,
  });
};

// create sub-category
export const createSubCategoryApi = async (subCategoryData) => {
  return apiProcessor({
    url: `${BASE}/create`,
    method: "POST",
    isPrivate: true,
    data: subCategoryData,
  });
};

// update sub-category
export const updateSubCategoryApi = async (subCatId, updateData) => {
  return apiProcessor({
    url: `${BASE}/update/${subCatId}`,
    method: "PATCH",
    isPrivate: true,
    data: updateData,
  });
};

// toggle sub-category status
export const toggleSubCategoryStatusApi = async (subCatId, isActive) => {
  return apiProcessor({
    url: `${BASE}/toggle-status/${subCatId}`,
    method: "PATCH",
    isPrivate: true,
    data: { isActive },
  });
};

// delete sub-category
export const deleteSubCategoryApi = async (subCatId) => {
  return apiProcessor({
    url: `${BASE}/delete/${subCatId}`,
    method: "DELETE",
    isPrivate: true,
  });
};
