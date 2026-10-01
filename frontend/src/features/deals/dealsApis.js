import { apiProcessor } from "../../helpers/axiosHelper";

const BASE = import.meta.env.VITE_ROOT_URL;

// Fetch all deals (paginated + searchable)
export const fetchAllDealsApi = async (page = 1, limit = 10, search = "") => {
    return apiProcessor({
        url: `${BASE}/api/v1/deals?page=${page}&limit=${limit}&search=${search}`,
        method: "GET",
        isPrivate: true,
    });
};

// Create a new deal — supports products[], categories[], or both
export const createDealApi = async (dealData) => {
    return apiProcessor({
        url: `${BASE}/api/v1/deals/create`,
        method: "POST",
        isPrivate: true,
        data: dealData,
    });
};

// Update an existing deal
export const updateDealApi = async (dealId, dealData) => {
    return apiProcessor({
        url: `${BASE}/api/v1/deals/update/${dealId}`,
        method: "PATCH",
        isPrivate: true,
        data: dealData,
    });
};

// Toggle a deal on/off
export const toggleDealStatusApi = async (dealId, isActive) => {
    return apiProcessor({
        url: `${BASE}/api/v1/deals/toggle-status/${dealId}`,
        method: "PATCH",
        isPrivate: true,
        data: { isActive },
    });
};

// Delete a deal
export const deleteDealApi = async (dealId) => {
    return apiProcessor({
        url: `${BASE}/api/v1/deals/delete/${dealId}`,
        method: "DELETE",
        isPrivate: true,
    });
};

// Fetch all products — used in the product picker inside the deal form
export const fetchAllProductsForPickerApi = async () => {
    return apiProcessor({
        url: `${BASE}/api/v1/products?limit=200`,
        method: "GET",
        isPrivate: true,
    });
};

// Fetch all categories — used in the category picker inside the deal form
export const fetchAllCategoriesForPickerApi = async () => {
    return apiProcessor({
        url: `${BASE}/api/v1/category?limit=100`,
        method: "GET",
        isPrivate: true,
    });
};
