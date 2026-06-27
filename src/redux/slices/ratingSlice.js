
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    ratingsData: {
        averageRating: 0,
        totalRatings: 0,
        userRating: null,
    },
};

// Create Rating
export const createRating = createAsyncThunk(
    "/ratings/createRating",
    async (data, { rejectWithValue }) => {
        try {
            const responsePromise = axiosInstance.post("/ratings", data);

            toast.promise(responsePromise, {
                loading: "Creating rating...",
                success: (res) =>
                    res?.data?.message || "Rating created successfully",
                error: (err) =>
                    err?.response?.data?.message || "Failed to create rating",
            });

            const response = await responsePromise;
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(
                error?.response?.data || "Something went wrong"
            );
        }
    }
);

// Get Rating
export const getAllRating = createAsyncThunk(
    "/ratings/getAll",
    async (bookId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/ratings/${bookId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch ratings");
            return rejectWithValue(
                error?.response?.data || "Something went wrong"
            );
        }
    }
);

// Update Rating
export const updateRating = createAsyncThunk(
    "/ratings/updateRating",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const responsePromise = axiosInstance.put(
                `/ratings/${id}`,
                data
            );

            toast.promise(responsePromise, {
                loading: "Updating rating...",
                success: (res) =>
                    res?.data?.message || "Rating updated successfully",
                error: (err) =>
                    err?.response?.data?.message || "Failed to update rating",
            });

            const response = await responsePromise;
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(
                error?.response?.data || "Something went wrong"
            );
        }
    }
);

const ratingSlice = createSlice({
    name: "ratings",
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder

            // Fetch rating
            .addCase(getAllRating.fulfilled, (state, action) => {
                const result = action.payload?.data;

                state.ratingsData = {
                    averageRating: result?.averageRating ?? 0,
                    totalRatings: result?.totalRatings ?? 0,
                    userRating: result?.userRating ?? null,
                };
            })

            // Create rating
            .addCase(createRating.fulfilled, (state, action) => {
                if (action.payload?.data) {
                    state.ratingsData.userRating = action.payload.data;
                }
            })

            // Update rating
            .addCase(updateRating.fulfilled, (state, action) => {
                if (action.payload?.data) {
                    state.ratingsData.userRating = action.payload.data;
                }
            });
    },
});

export default ratingSlice.reducer;

