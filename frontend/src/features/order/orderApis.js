import { apiProcessor } from "../../helpers/axiosHelper";

const BASE = import.meta.env.VITE_ROOT_URL;

// Fetch all orders — supports page, limit, and search query
export const fetchAllOrdersApi = async (page = 1, limit = 10, query = "") => {
    return apiProcessor({
        url: `${BASE}/api/v1/orders?page=${page}&limit=${limit}&query=${query}`,
        method: "GET",
        isPrivate: true,
    });
};

// Fetch a single order by ID
export const fetchOrderByIdApi = async (orderId) => {
    return apiProcessor({
        url: `${BASE}/api/v1/orders/${orderId}`,
        method: "GET",
        isPrivate: true,
    });
};

// Update the status of an order (also triggers email to customer on backend)
export const updateOrderStatusApi = async (orderId, orderStatus) => {
    return apiProcessor({
        url: `${BASE}/api/v1/orders/update-status/${orderId}`,
        method: "PATCH",
        isPrivate: true,
        data: { orderStatus },
    });
};
