import { apiProcessor } from "../../helpers/axiosHelper";


// fetchall products
export const fetchAllProductApi = async(page=1, limit=10, search= "") =>{
    return apiProcessor({
        url: `${import.meta.env.VITE_ROOT_URL}/api/v1/products/all-products?page=${page}&limit=${limit}&search=${search}`,
        method: 'GET',
        isPrivate: true,
    })
}

// add products
export const addProductApi = async(productData) =>{
    return apiProcessor({
        url: `${import.meta.env.VITE_ROOT_URL}/api/v1/products/create-product`,
        method: 'POST',
        isPrivate: true,
        data: productData,
    })
}

//updateproducts
export const updateProductApi = async(productId, updateData) =>{
    return apiProcessor({
        url:`${import.meta.env.VITE_ROOT_URL}/api/v1/products/update-product/${productId}`,
        method: 'PATCH',
        isPrivate: true,
        data: updateData,
    })
}

//delete products
export const deleteProductApi = async(productId) =>{
    return apiProcessor({
        url:`${import.meta.env.VITE_ROOT_URL}/api/v1/products/delete-product/${productId}`,
        method: 'DELETE',
        isPrivate: true,
    })
}

//get product by id
export const getProductByIdApi = async(productId) =>{
    return apiProcessor({
        url:`${import.meta.env.VITE_ROOT_URL}/api/v1/products/${productId}`,
        method: 'GET',
        isPrivate: true,
    })
}

//update stock
export const updateStockApi = async(productId, stockData) =>{
    return apiProcessor({
        url:`${import.meta.env.VITE_ROOT_URL}/api/v1/products/update-stock/${productId}`,
        method: 'PATCH',
        isPrivate: true,
        data: stockData,
    })
}

//update status
export const updateStatusApi = async(productId, status) =>{
    return apiProcessor({
        url:`${import.meta.env.VITE_ROOT_URL}/api/v1/products/update-status/${productId}`,
        method: 'PATCH',
        isPrivate: true,
        data: status,
    })
}

// upload product image → returns { status, url } (S3 URL)
export const uploadProductImageApi = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiProcessor({
        url: `${import.meta.env.VITE_ROOT_URL}/api/v1/products/upload-image`,
        method: 'POST',
        isPrivate: true,
        data: formData,
        contentType: "multipart/form-data",
    });
};
