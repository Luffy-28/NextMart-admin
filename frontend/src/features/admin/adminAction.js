import { adminLoginApis, getUserDetailApis } from "./adminApis.js";
import { setAdmin, setLoading, setError } from "./adminSlice.js";

export const loginUser = (formData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const data = await adminLoginApis(formData);
    if (data.status === "success") {
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      } else {
        dispatch(setError("No access token received from server."));
        return false;
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      const userResponse = await getUserDetailApis();
      if (userResponse.status === "success") {
        dispatch(setAdmin(userResponse.user));
        return true;
      } else {
        dispatch(setError(userResponse.message));
        return false;
      }
    } else {
      dispatch(setError(data.message || "Login failed. Please check your credentials."));
      return false;
    }
  } catch (error) {
    dispatch(setError(error.message));
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

export const autoLogin = () => async (dispatch) =>{
  try {
    dispatch(setLoading(true));
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const userResponse = await getUserDetailApis();
      if (userResponse.status === "success") {
        dispatch(setAdmin(userResponse.user));
      } else {
        dispatch(
          setError(userResponse.message || "Failed to fetch user details"),
        );
      }
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
}
