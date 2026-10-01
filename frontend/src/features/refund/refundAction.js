import { fetchAllRefundsApi, processRefundApi } from "./refundApis";
import {
  setRefunds,
  setCounts,
  setLoading,
  setError,
  setPagination,
  updateRefundInList,
} from "./refundSlice";

export const fetchAllRefunds = (status = "", page = 1, limit = 50) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetchAllRefundsApi(status, page, limit);
    if (response.status === "success") {
      dispatch(setRefunds(response.data));
      if (response.counts) {
        dispatch(setCounts(response.counts));
      }
      if (response.pagination) {
        dispatch(setPagination(response.pagination));
      }
      return response;
    } else {
      dispatch(setError(response.message || "Failed to fetch refund requests"));
    }
  } catch (error) {
    console.error(error);
    dispatch(setError("Failed to fetch refund requests"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const processRefund = (requestId, payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await processRefundApi(requestId, payload);
    if (response.status === "success") {
      if (response.data) {
        dispatch(updateRefundInList(response.data));
      }
      // Re-fetch to get updated tab counts and populated relations
      dispatch(fetchAllRefunds("", 1, 50));
      return response;
    } else {
      dispatch(setError(response.message || "Failed to process refund"));
      return response;
    }
  } catch (error) {
    console.error(error);
    dispatch(setError("Failed to process refund"));
    return { status: "error", message: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};
