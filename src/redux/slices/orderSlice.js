import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
  ordersData: [],
  loading: false,
  error: null,
};

export const getAllOrders = createAsyncThunk(
  "/orders/getAllOrders",
  async () => {
    try {
      const apiResponse = await axiosInstance.get("/orders/all");
      return apiResponse;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to fetch orders");
      throw error;
    }
  },
);

export const getAllUserOrders = createAsyncThunk(
  "/orders/getAllUserOrders",
  async () => {
    try {
      const apiResponse = await axiosInstance.get("/orders");
      return apiResponse;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to fetch orders");
      throw error;
    }
  },
);

export const createOrder = createAsyncThunk(
  "/orders/createOrder",
  async (data) => {
    try {
      const response = axiosInstance.post("/orders", data);
      toast.promise(response, {
        loading: "Creating order...",
        success: (resolvedPromise) =>
          resolvedPromise?.data?.message || "Order created successfully",
        error: (err) =>
          err?.response?.data?.message || "Failed to create order",
      });
      const apiResponse = await response;
      return apiResponse;
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      throw error;
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "/orders/updateOrderStatus",
  async ({ orderId, status }) => {
    try {
      const response = axiosInstance.put(`/orders/${orderId}/status`, {
        status,
      });
      toast.promise(response, {
        loading: "Updating order status...",
        success: "Order status updated successfully",
        error: (err) =>
          err?.response?.data?.message || "Failed to update order status",
      });
      const apiResponse = await response;
      return apiResponse;
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      throw error;
    }
  },
);

export const cancelOrder = createAsyncThunk(
  "/orders/cancelOrder",
  async (orderId) => {
    try {
      const response = axiosInstance.put(`/orders/${orderId}/cancel`);
      toast.promise(response, {
        loading: "Cancelling order...",
        success: "Order cancelled successfully",
        error: (err) =>
          err?.response?.data?.message || "Failed to cancel order",
      });
      const apiResponse = await response;
      return apiResponse;
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      throw error;
    }
  },
);

export const deleteOrder = createAsyncThunk(
  "/orders/deleteOrder",
  async (orderId) => {
    try {
      const response = axiosInstance.delete(`/orders/${orderId}`);
      toast.promise(response, {
        loading: "Deleting order...",
        success: "Order deleted successfully",
        error: (err) =>
          err?.response?.data?.message || "Failed to delete order",
      });
      const apiResponse = await response;
      return { orderId, response: apiResponse };
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      throw error;
    }
  },
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        const fetchedOrders =
          action?.payload?.data?.data || action?.payload?.data || [];
        state.ordersData = Array.isArray(fetchedOrders) ? fetchedOrders : [];
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load orders";
      })

      .addCase(getAllUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        const fetchedOrders =
          action?.payload?.data?.data || action?.payload?.data || [];
        state.ordersData = Array.isArray(fetchedOrders) ? fetchedOrders : [];
      })
      .addCase(getAllUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load orders";
      })

      .addCase(createOrder.fulfilled, (state, action) => {
        const newOrder = action?.payload?.data?.data || action?.payload?.data;
        if (newOrder) {
          state.ordersData.unshift(newOrder);
        }
      })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder =
          action?.payload?.data?.data || action?.payload?.data;
        if (updatedOrder) {
          state.ordersData = state.ordersData.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order,
          );
        }
      })

      .addCase(cancelOrder.fulfilled, (state, action) => {
        const cancelledOrder =
          action?.payload?.data?.data || action?.payload?.data;
        if (cancelledOrder) {
          state.ordersData = state.ordersData.map((order) =>
            order._id === cancelledOrder._id ? cancelledOrder : order,
          );
        }
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        if (action.payload && action.payload.orderId) {
          state.ordersData = state.ordersData.filter(
            (order) => (order._id || order.id) !== action.payload.orderId,
          );
        }
      });
  },
});

export default orderSlice.reducer;
