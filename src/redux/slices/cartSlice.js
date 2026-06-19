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
  reducers: {
    setGuestCart: (state, action) => {
      state.cartData = action.payload || [];
      state.totalAmount = state.cartData.reduce((sum, item) => {
        const price = item.book?.price || 0;
        return sum + (price * (item.quantity || 1));
      }, 0);
    },
    addToGuestCart: (state, action) => {
      const book = action.payload;
      const exists = state.cartData.some(item => {
        const id = item.book && typeof item.book === 'object' ? item.book._id : item.book;
        return id === book._id;
      });
      if (!exists) {
        state.cartData.push({
          _id: `guest_${Date.now()}_${Math.random()}`,
          cartItemId: `guest_${Date.now()}`,
          book: book,
          quantity: 1
        });
        state.totalAmount = state.cartData.reduce((sum, item) => {
          const price = item.book?.price || 0;
          return sum + (price * (item.quantity || 1));
        }, 0);
        localStorage.setItem("guest_cart", JSON.stringify(state.cartData));
      }
    },
    removeFromGuestCart: (state, action) => {
      const cartItemId = action.payload;
      state.cartData = state.cartData.filter(item => item.cartItemId !== cartItemId);
      state.totalAmount = state.cartData.reduce((sum, item) => {
        const price = item.book?.price || 0;
        return sum + (price * (item.quantity || 1));
      }, 0);
      localStorage.setItem("guest_cart", JSON.stringify(state.cartData));
    },
    updateGuestCartQty: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      state.cartData = state.cartData.map(item => {
        if (item.cartItemId === cartItemId) {
          return { ...item, quantity };
        }
        return item;
      });
      state.totalAmount = state.cartData.reduce((sum, item) => {
        const price = item.book?.price || 0;
        return sum + (price * (item.quantity || 1));
      }, 0);
      localStorage.setItem("guest_cart", JSON.stringify(state.cartData));
    }
  },

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

export const {
  setGuestCart,
  addToGuestCart,
  removeFromGuestCart,
  updateGuestCartQty
} = cartSlice.actions;

export default cartSlice.reducer;
