import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    loading: false,
    error: null,
}

const adminSlice = createSlice({
    name: "admin",
    initialState,

    reducers: {
        setAdmin:(state, action) =>{
            state.user = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLoading:(state, action) =>{
            state.loading = action.payload;
        },
        setError:(state, action) =>{
            state.error = action.payload;
            state.loading = false;
        },
        setLogout:(state) =>{
            state.user = null;
            state.loading = false;
            state.error = null;

            localStorage.removeItem("accessToken");
        }
    }
})

export const {setAdmin, setLoading, setError, setLogout} = adminSlice.actions;
export default adminSlice.reducer;