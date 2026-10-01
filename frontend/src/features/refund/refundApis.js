import { apiProcessor } from "../../helpers/axiosHelper";

export const fetchAllRefundsApi = async (status = "", page = 1, limit = 50) => {
  const queryParams = new URLSearchParams();
  if (status && status !== "all") queryParams.append("status", status);
  if (page) queryParams.append("page", page);
  if (limit) queryParams.append("limit", limit);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  return apiProcessor({
    url: `${import.meta.env.VITE_ROOT_URL}/api/v1/refunds${queryString}`,
    method: "GET",
    isPrivate: true,
  });
};

export const processRefundApi = async (requestId, payload) => {
  return apiProcessor({
    url: `${import.meta.env.VITE_ROOT_URL}/api/v1/refunds/process/${requestId}`,
    method: "PATCH",
    data: payload,
    isPrivate: true,
  });
};
