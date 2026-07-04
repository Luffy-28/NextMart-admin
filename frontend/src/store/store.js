import {configureStore} from "@reduxjs/toolkit";
import adminReducer from "../features/admin/adminSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";



export const store = configureStore({
    reducer:{
        adminStore: adminReducer,
        dashboardStore: dashboardReducer,
    }
})