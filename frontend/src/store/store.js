import {configureStore} from "@reduxjs/toolkit";
import adminReducer from "../features/admin/adminSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import productReducer from "../features/product/productSlice";
import categoryReducer from "../features/category/categorySlice";
import subCategoryReducer from "../features/subCategory/suCategorySlice";
import customerReducer from "../features/customer/customerSlice";

export const store = configureStore({
    reducer:{
        adminStore: adminReducer,
        dashboardStore: dashboardReducer,
        productStore: productReducer,
        categoryStore: categoryReducer,
        subCategoryStore: subCategoryReducer,
        customerStore: customerReducer,
    }
})