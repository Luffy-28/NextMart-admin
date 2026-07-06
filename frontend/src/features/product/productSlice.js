import {createSlice} from "@reduxjs/toolkit"


const initialState = {
    products:[],
    loading: false,
    error: null,
   pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 10,
    },
}

const ProductSlice = createSlice({
    name: 'product',
    initialState,
    reducers:{
        setProducts:(state,action) =>{
            state.products = action.payload;
        },
        setLoading:(state, action) =>{
            state.loading = action.payload
        },
        setError:(state,action) =>{
            state.error = action.payload
            state.loading = false
        },
        setPagination: (state, action) => {
            state.pagination.currentPage = action.payload.currentPage;
            state.pagination.totalPages = action.payload.totalPages;
            state.pagination.totalItems = action.payload.totalItems;
            state.pagination.limit = action.payload.limit;
        },
    }
})

export const {setProducts, setLoading, setError, setPagination} = ProductSlice.actions
export default ProductSlice.reducer