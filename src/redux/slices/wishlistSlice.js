import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    wishlistData: [],
    isLoading: false,
};

// Toggle wishlist (add/remove book)
export const toggleWishlist = createAsyncThunk(
    "/wishlist/toggle",
    async (bookId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/wishlist", { book: bookId });
            
            // Show appropriate toast based on the action
            if (response.data.message.includes("added")) {
                toast.success("Added to wishlist");
            } else if (response.data.message.includes("removed")) {
                toast.success("Removed from wishlist");
            }
            
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to update wishlist";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Get all wishlist items
export const getAllWishlist = createAsyncThunk(
    "/wishlist/getAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/wishlist");
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to fetch wishlist";
            return rejectWithValue(message);
        }
    }
);

// Update wishlist item status
export const updateWishlistStatus = createAsyncThunk(
    "/wishlist/updateStatus",
    async ({ wishlistId, status }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/wishlist/${wishlistId}`, { status });
            toast.success("Status updated successfully");
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to update status";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Delete wishlist item
export const deleteWishlistItem = createAsyncThunk(
    "/wishlist/delete",
    async (wishlistId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/wishlist/${wishlistId}`);
            toast.success("Removed from wishlist");
            return { wishlistId, response: response.data };
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to remove item";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        clearWishlist: (state) => {
            state.wishlistData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all wishlist
            .addCase(getAllWishlist.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllWishlist.fulfilled, (state, action) => {
                state.isLoading = false;
                const fetchedWishlist = action?.payload?.data || [];
                state.wishlistData = Array.isArray(fetchedWishlist) ? fetchedWishlist : [];
            })
            .addCase(getAllWishlist.rejected, (state) => {
                state.isLoading = false;
                state.wishlistData = [];
            })

            // Toggle wishlist
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                // Refresh the list after toggle - the backend returns updated data
                const updatedData = action?.payload?.data;
                if (updatedData) {
                    // If item was added, it will be in the response
                    // If removed, we need to refetch or handle it
                    // For simplicity, we'll refetch in the component
                }
            })

            // Update status
            .addCase(updateWishlistStatus.fulfilled, (state, action) => {
                const updatedItem = action?.payload?.data;
                if (updatedItem && updatedItem._id) {
                    state.wishlistData = state.wishlistData.map((item) => {
                        if (item._id === updatedItem._id) {
                            // Merge the update while preserving the book data
                            return {
                                ...item,
                                status: updatedItem.status,
                                // Preserve the populated book data if it exists
                                book: item.book
                            };
                        }
                        return item;
                    });
                }
            })

            // Delete item
            .addCase(deleteWishlistItem.fulfilled, (state, action) => {
                if (action.payload && action.payload.wishlistId) {
                    state.wishlistData = state.wishlistData.filter(
                        (item) => item._id !== action.payload.wishlistId
                    );
                }
            });
    },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
