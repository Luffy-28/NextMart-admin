import { apiProcessor} from "../../helpers/axiosHelper.js";


export const adminLoginApis = async(loginUserData) =>{
    return await apiProcessor({
        url:`${import.meta.env.VITE_ROOT_URL}/api/v1/auth/login`,
        method: "POST",
        isPrivate: false,
        data: loginUserData,
    })
}


export const getUserDetailApis = async() =>{
    return await apiProcessor({
        url:`${import.meta.env.VITE_ROOT_URL}/api/v1/users`,
        method: "GET",
        isPrivate: true,
    })
}