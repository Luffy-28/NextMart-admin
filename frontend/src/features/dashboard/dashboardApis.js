import { apiProcessor } from "../../helpers/axiosHelper";


export const dashboardStatsApi = async (days = 30) => {
    return await apiProcessor({
        url: `${import.meta.env.VITE_ROOT_URL}/api/v1/dashboard/stats?days=${days}`,
        method: 'GET',
        isPrivate: true,
    })
}

export const revenueOverTimeApi = async (period = "daily", days = 30) => {
    return await apiProcessor({
        url: `${import.meta.env.VITE_ROOT_URL}/api/v1/dashboard/revenue?period=${period}&days=${days}`,
        method: 'GET',
        isPrivate: true,
    })
}

export const bestSellingProductsApi = async(limit = 5) => {
    return await apiProcessor({
        url: `${import.meta.env.VITE_ROOT_URL}/api/v1/dashboard/best-selling?limit=${limit}`,
        method: 'GET',
        isPrivate: true,
    })
}

export const latestOrdersApi = async (limit = 5) => {
    return await apiProcessor({
        url: `${import.meta.env.VITE_ROOT_URL}/api/v1/dashboard/recent-orders?limit=${limit}`,
        method: 'GET',
        isPrivate: true,
    })
}
