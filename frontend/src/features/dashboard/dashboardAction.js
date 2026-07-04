import {
    dashboardStatsApi,
    revenueOverTimeApi,
    bestSellingProductsApi,
    latestOrdersApi
} from "./dashboardApis.js";

import {
    setStats,
    setRevenue,
    setBestSelling,
    setLatestOrders,
    setLoading,
    setError,
    clearError
} from "./dashboardSlice.js";


export const fetchDashboardStats = (days = 30) => async (dispatch) => {
    try{
        dispatch(setLoading(true));
        const data = await dashboardStatsApi(days);
        if(data?.status === "success"){
            dispatch(setStats(data.data));
            return data;
        }
    }catch(error){
        console.log(error);
        dispatch(setError(error?.response?.data?.message || "Something went wrong"));
        return error.response?.data;
    }finally{
        dispatch(setLoading(false));
    }
}

export const fetchDashboardRevenue = (period = "daily", days = 30) => async (dispatch) => {
    try{
        dispatch(setLoading(true));
        const data = await revenueOverTimeApi(period, days);
        if(data?.status === "success"){
            dispatch(setRevenue(data.data));
            return data;
        }
    }catch(error){
        console.log(error);
        dispatch(setError(error?.response?.data?.message || "Something went wrong"));
        return error.response?.data;
    }finally{
        dispatch(setLoading(false));
    }
}

export const fetchDashboardBestSelling = (limit = 5) => async (dispatch) => {
    try{
        dispatch(setLoading(true));
        const data = await bestSellingProductsApi(limit);
        if(data?.status === "success"){
            dispatch(setBestSelling(data.data));
            return data;
        }
    }catch(error){
        console.log(error);
        dispatch(setError(error?.response?.data?.message || "Something went wrong"));
        return error.response?.data;
    }finally{
        dispatch(setLoading(false));
    }
}
    
export const fetchDashboardLatestOrders = (limit = 5) => async (dispatch) => {
    try{
        dispatch(setLoading(true));
        const data = await latestOrdersApi(limit);
        if(data?.status === "success"){
            dispatch(setLatestOrders(data.data));
            return data;
        }
    }catch(error){
        console.log(error);
        dispatch(setError(error?.response?.data?.message || "Something went wrong"));
        return error.response?.data;
    }finally{
        dispatch(setLoading(false));
    }
}

    