import { apiProcessor } from "../../helpers/axiosHelper";

const BASE = `${import.meta.env.VITE_ROOT_URL}/api/v1/category`;

// fetch all categories
export const fetchAllCategoriesApi = async (page = 1, limit = 100, search = "") => {
  return apiProcessor({
    url: `${BASE}?page=${page}&limit=${limit}&search=${search}`,
    method: "GET",
    isPrivate: true,
  });
};

// create category
export const createCategoryApi = async (categoryData) => {
  return apiProcessor({
    url: `${BASE}/create`,
    method: "POST",
    isPrivate: true,
    data: categoryData,
  });
};

// update category
export const updateCategoryApi = async (catId, updateData) => {
  return apiProcessor({
    url: `${BASE}/update/${catId}`,
    method: "PATCH",
    isPrivate: true,
    data: updateData,
  });
};

// delete category (soft-delete — sets isActive: false on backend)
export const deleteCategoryApi = async (catId) => {
  return apiProcessor({
    url: `${BASE}/delete/${catId}`,
    method: "DELETE",
    isPrivate: true,
  });
};

// upload category image → returns { status, url } (S3 URL)
export const uploadCategoryImageApi = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiProcessor({
    url: `${BASE}/upload-image`,
    method: "POST",
    isPrivate: true,
    data: formData,
    contentType: "multipart/form-data",
  });
};
