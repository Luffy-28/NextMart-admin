import axios from "axios";

export const apiProcessor = async ({
  url,
  method,
  data,
  contentType,
  isPrivate = false,
  isRefresh = false,
}) => {
  try {
    const resp = await axios({
      url,
      method,
      data,
      headers: {
        // For multipart/form-data, do NOT set Content-Type manually —
        // axios must auto-set it so it includes the required boundary string.
        ...(contentType && contentType !== "multipart/form-data"
          ? { "Content-Type": contentType }
          : contentType === "multipart/form-data"
          ? {}  // let axios set it
          : { "Content-Type": "application/json" }),
        Authorization: isPrivate
          ? isRefresh
            ? `Bearer ${localStorage.getItem("refreshToken")}`
            : `Bearer ${localStorage.getItem("accessToken")}`
          : "",
      },
    });
    return resp.data;
  } catch (error) {
    console.log(error);
    // check if jwt expired

    if (error?.response?.data?.message === "jwt expired") {
      // refresh the access token
      // api call

      let resp = await apiProcessor({
        url: import.meta.env.VITE_ROOT_URL + "/api/v1/auth/refresh",
        method: "GET",
        isPrivate: true,
        isRefresh: true,
      });

      if (resp.status == "success") {
        // update accessToken in localStorage
        localStorage.setItem("accessToken", resp.accessToken);
        // recall the original api call
        return apiProcessor({
          url,
          method,
          data,
          contentType,
          isPrivate,
          isRefresh,
        });
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }

    // Also clear tokens for any other unhandled 401 errors
    if (error?.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }

    return {
      status: "error",
      message: error?.response?.data?.message || "Error in api call",
    };
  }
};
