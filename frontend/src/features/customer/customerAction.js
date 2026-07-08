import { fetchAllCustomersApis, updateCustomerStatusApis } from "./customerApis.js";
import { setLoading, setCustomers, updateCustomerStatusInState, setError } from "./customerSlice.js";

export const fetchAllCustomers = (queryOptions) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const data = await fetchAllCustomersApis(queryOptions);
    if (data.status === "success") {
      dispatch(setCustomers(data));
      return true;
    } else {
      dispatch(setError(data.message || "Failed to fetch customers"));
      return false;
    }
  } catch (error) {
    dispatch(setError(error.message));
    return false;
  }
};

export const updateCustomerStatus = (id, statusData) => async (dispatch) => {
  try {
    const data = await updateCustomerStatusApis(id, statusData);
    if (data.status === "success") {
      dispatch(updateCustomerStatusInState({ id, ...statusData }));
      return true;
    } else {
      dispatch(setError(data.message || "Failed to update customer status"));
      return false;
    }
  } catch (error) {
    dispatch(setError(error.message));
    return false;
  }
};
