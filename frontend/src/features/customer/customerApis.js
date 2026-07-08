import { apiProcessor } from "../../helpers/axiosHelper.js";

export const fetchAllCustomersApis = async ({ page = 1, limit = 10, search = "", role = "", status = "" }) => {
  let query = `page=${page}&limit=${limit}&search=${search}`;
  if (role) query += `&role=${role}`;
  if (status) query += `&status=${status}`;

  return await apiProcessor({
    url: `${import.meta.env.VITE_ROOT_URL}/api/v1/customers?${query}`,
    method: "GET",
    isPrivate: true,
  });
};

export const updateCustomerStatusApis = async (id, { status, reason }) => {
  return await apiProcessor({
    url: `${import.meta.env.VITE_ROOT_URL}/api/v1/customers/${id}/status`,
    method: "PATCH",
    isPrivate: true,
    data: { status, reason },
  });
};
