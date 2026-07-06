import { createSlice} from '@reduxjs/toolkit';

const initialState = {
    stats : null,
    revenue : null,
    bestSelling : null,
    latestOrders : null,
    loading : true,
    error : null,
}


const dashboardSlice = createSlice({
    name : 'dashboard',
    initialState,

    reducers: {
        setStats: (state, action) => {
            state.stats = action.payload;
        },
        setRevenue: (state, action) => {
            state.revenue = action.payload;
        },
        setBestSelling: (state, action) => {
            state.bestSelling = action.payload;
        },
        setLatestOrders: (state, action) => {
            state.latestOrders = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    }
})

export const {setStats, setRevenue, setBestSelling, setLatestOrders, setLoading, setError, clearError} = dashboardSlice.actions;
export default dashboardSlice.reducer;