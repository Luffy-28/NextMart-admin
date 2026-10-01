import {
    fetchAllDealsApi,
    createDealApi,
    updateDealApi,
    toggleDealStatusApi,
    deleteDealApi,
    fetchAllProductsForPickerApi,
    fetchAllCategoriesForPickerApi,
} from "./dealsApis";
import {
    setDeals, setLoading, setError, setStats,
    setAllProducts, setAllCategories,
    addDeal, updateDealInList, removeDeal,
} from "./dealsSlice";

// Fetch all deals
export const fetchAllDeals = (page = 1, limit = 10, search = "") => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const response = await fetchAllDealsApi(page, limit, search);
        if (response.status === "success") {
            dispatch(setDeals(response.deals));
            dispatch(setStats(response.stats));
        } else {
            dispatch(setError(response.message || "Failed to fetch deals"));
        }
    } catch (error) {
        dispatch(setError("Failed to fetch deals"));
    } finally {
        dispatch(setLoading(false));
    }
};

// Load all products and categories for the form pickers
export const loadPickerData = () => async (dispatch) => {
    try {
        const [prodRes, catRes] = await Promise.all([
            fetchAllProductsForPickerApi(),
            fetchAllCategoriesForPickerApi(),
        ]);
        if (prodRes.status === "success") {
            dispatch(setAllProducts(prodRes.data || prodRes.products || []));
        }
        if (catRes.status === "success") {
            dispatch(setAllCategories(catRes.data || catRes.categories || []));
        }
    } catch (error) {
        console.log("Failed to load picker data:", error);
    }
};

// Create a new deal
export const createDeal = (dealData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const response = await createDealApi(dealData);
        if (response.status === "success") {
            dispatch(addDeal(response.data));
            return true;
        } else {
            dispatch(setError(response.message || "Failed to create deal"));
            return false;
        }
    } catch (error) {
        dispatch(setError("Failed to create deal"));
        return false;
    } finally {
        dispatch(setLoading(false));
    }
};

// Update an existing deal
export const updateDeal = (dealId, dealData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const response = await updateDealApi(dealId, dealData);
        if (response.status === "success") {
            dispatch(updateDealInList(response.data));
            return true;
        } else {
            dispatch(setError(response.message || "Failed to update deal"));
            return false;
        }
    } catch (error) {
        dispatch(setError("Failed to update deal"));
        return false;
    } finally {
        dispatch(setLoading(false));
    }
};

// Toggle deal active/inactive
export const toggleDealStatus = (dealId, isActive) => async (dispatch) => {
    try {
        const response = await toggleDealStatusApi(dealId, isActive);
        if (response.status === "success") {
            dispatch(updateDealInList(response.data));
            return true;
        }
        return false;
    } catch (error) {
        dispatch(setError("Failed to toggle deal status"));
        return false;
    }
};

// Delete a deal
export const deleteDeal = (dealId) => async (dispatch) => {
    try {
        const response = await deleteDealApi(dealId);
        if (response.status === "success") {
            dispatch(removeDeal(dealId));
            return true;
        }
        return false;
    } catch (error) {
        dispatch(setError("Failed to delete deal"));
        return false;
    }
};
