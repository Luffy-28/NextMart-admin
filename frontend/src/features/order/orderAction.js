import { fetchAllOrdersApi, updateOrderStatusApi } from "./orderApis";
import { setOrders, setLoading, setError, setPagination, updateOrderInList } from "./orderSlice";

// Fetch all orders with optional pagination and search
export const fetchAllOrders = (page = 1, limit = 10, query = "") => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const response = await fetchAllOrdersApi(page, limit, query);
        if (response.status === "success") {
            dispatch(setOrders(response.data));
            dispatch(setPagination({
                currentPage: response.pagination.page,
                totalPages:  response.pagination.totalPage,
                totalItems:  response.pagination.totalOrder,
                limit:       response.pagination.limit,
            }));
            return response;
        }
    } catch (error) {
        console.log(error);
        dispatch(setError("Failed to fetch orders"));
    } finally {
        dispatch(setLoading(false));
    }
};

// Update order status — the backend will also send an email to the customer
export const updateOrderStatus = (orderId, orderStatus) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const response = await updateOrderStatusApi(orderId, orderStatus);
        if (response.status === "success") {
            // Update just this one order in the list (no need to re-fetch everything)
            dispatch(updateOrderInList(response.data));
            return response;
        }
    } catch (error) {
        console.log(error);
        dispatch(setError("Failed to update order status"));
    } finally {
        dispatch(setLoading(false));
    }
};
