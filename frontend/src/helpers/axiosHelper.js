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
        "Content-Type": contentType ?? "application/json",
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
          isPrivate,
          isRefresh,
        });
      }
    }

    return {
      status: "error",
      message: error?.response?.data?.message || "Error in api call",
    };
  }
};
