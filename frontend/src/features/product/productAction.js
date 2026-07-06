import {
  addProductApi,
  fetchAllProductApi,
  getProductByIdApi,
  updateProductApi,
  deleteProductApi,
  updateStockApi,
  updateStatusApi,
} from "./productApis";
import { setError, setLoading, setProducts, setPagination } from "./productSlice";

//fetch all product api
export const fetchAllProducts = (page, limit, search) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetchAllProductApi(page, limit, search);
    if (response.status === "success") {
      dispatch(setProducts(response.products));  
      dispatch(setPagination({
        currentPage:response.pagination.page,
        totalPages:response.pagination.totalPages,
        totalItems:response.pagination.total,  
        limit:response.pagination.limit,
      }));
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};

//Add product api
export const addProduct = (productData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    let response = await addProductApi(productData);
    if (response.status === "success") {
      dispatch(fetchAllProducts(1, 10, ""));
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};

// get product by id api
export const getProductById = (productId) => async(dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await getProductByIdApi(productId);
    if(response.status === "success"){
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  }finally{
    dispatch(setLoading(false));
  }
}

//update product by id api
export const updateProduct = (productId, updateData) => async(dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await updateProductApi(productId, updateData);
    if(response.status === "success"){
      dispatch(fetchAllProducts(1, 10, ""));
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  }finally{
    dispatch(setLoading(false));
  }
}

//delete prouct by id api
export const deleteProduct = (productId) => async(dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await deleteProductApi(productId);
    if(response.status === "success"){
      dispatch(fetchAllProducts(1, 10, ""));
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  }finally{
    dispatch(setLoading(false));
  }
}

// update stock api
export const updateStock = (productId, stockData) => async(dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await updateStockApi(productId, stockData);
    if(response.status === "success"){
      dispatch(fetchAllProducts(1, 10, ""));
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  }finally{
    dispatch(setLoading(false));
  }
}

//update status api
export const updateStatus = (productId, status) => async(dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await updateStatusApi(productId, status);
    if(response.status === "success"){
      dispatch(fetchAllProducts(1, 10, ""));
      return response;
    }
  } catch (error) {
    console.log(error);
    dispatch(setError(error));
  }finally{
    dispatch(setLoading(false));
  }
}
