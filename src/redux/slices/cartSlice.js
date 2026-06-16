import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
  cartData: [],
};

// Get Cart
export const getCart = createAsyncThunk(
  "/cart/getCart",
  async () => {
    try {
      const response = await axiosInstance.get("/cart");
      return response;
    } catch (error) {
      console.log(error);
    }
  }
);

// Add To Cart
export const addToCart = createAsyncThunk(
  "/cart/addToCart",
  async (bookId) => {
    try {
      const response = axiosInstance.post("/cart", {
        bookId,
        quantity: 1,
      });

      return await response;
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  }
);

// Update Cart Item
export const updateCartItem = createAsyncThunk(
  "/cart/updateCartItem",
  async ({ cartItemId, quantity }) => {
    try {
      const response = await axiosInstance.put(
        `/cart/${cartItemId}`,
        { quantity }
      );

      console.log("UPDATE RESPONSE", response.data);

      return response;

    } catch (error) {
      console.log(error);
    }
  }
);

// Remove Cart Item
export const removeCartItem = createAsyncThunk(
  "/cart/removeCartItem",
  async (cartItemId) => {
    try {
      const response = axiosInstance.delete(`/cart/${cartItemId}`);

      toast.promise(response, {
        loading: "Removing item...",
        success: "Item removed",
        error: (err) =>
          err?.response?.data?.message || "Failed to remove item",
      });

      await response;
      return cartItemId;
    } catch (error) {
      console.log(error);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(getCart.fulfilled, (state, action) => {
        const payloadData = action?.payload?.data?.data;

        state.cartData = payloadData?.items ?? [];
        state.totalAmount = payloadData?.totalAmount ?? 0;
      })


      .addCase(addToCart.fulfilled, (state, action) => {
        const newItem =
          action?.payload?.data?.data ||
          action?.payload?.data;

        if (newItem) {
          state.cartData.push(newItem);
        }
      })

      .addCase(updateCartItem.fulfilled, (state, action) => {
        const updatedItem =
          action?.payload?.data?.data ||
          action?.payload?.data;

        state.cartData = state.cartData.map((item) =>
          item.cartItemId === updatedItem.cartItemId
            ? updatedItem
            : item
        );
      })


      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cartData = state.cartData.filter(
          (item) => item._id !== action.payload
        );
      });
  },
});

export default cartSlice.reducer;
