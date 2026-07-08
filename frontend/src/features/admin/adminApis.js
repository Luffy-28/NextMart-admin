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

export const updateAdminProfileApis = async (profileData) => {
  return await apiProcessor({
    url: `${import.meta.env.VITE_ROOT_URL}/api/v1/users/profile`,
    method: "PATCH",
    isPrivate: true,
    data: profileData,
  });
};

export const fetchSecurityLogsApi = async () => {
  return await apiProcessor({
    url: `${import.meta.env.VITE_ROOT_URL}/api/v1/users/security-logs`,
    method: "GET",
    isPrivate: true,
  });
};