import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    categoriesData: [],
};

export const createCategory = createAsyncThunk(
    "/categories/createCategory",
    async (data) => {
        try {
            const response = axiosInstance.post("/categories", data);

            toast.promise(response, {
                success: (resolvedPromise) => {
                    return (
                        resolvedPromise?.data?.message ||
                        "Category created successfully"
                    );
                },
                loading: "Creating category...",
                error: (err) => {
                    return err?.response?.data?.message || "Failed to create category";
                },
            });

            const apiResponse = await response;
            return apiResponse;
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }
);

export const getAllCategories = createAsyncThunk(
    "/categories/getAll",
    async () => {
        try {
            const apiResponse = await axiosInstance.get("/categories");
            return apiResponse;
        } catch (error) {
            console.log(error);
        }
    }
);

export const updateCategory = createAsyncThunk(
    "/categories/updateCategory",
    async ({ id, data }) => {
        try {
            const response = axiosInstance.put(
                `/categories/${id}`,
                data
            );

            toast.promise(response, {
                loading: "Updating category...",
                success: "Category updated successfully",
                error: (err) => {
                    return err?.response?.data?.message || "Failed to update category";
                },
            });

            const apiResponse = await response;
            return apiResponse;
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }
);

export const deleteCategory = createAsyncThunk(
    "/categories/deleteCategory",
    async (categoryId) => {
        try {
            const response = axiosInstance.delete(
                `/categories/${categoryId}`
            );

            toast.promise(response, {
                loading: "Deleting category...",
                success: "Category deleted successfully",
                error: (err) => {
                    return err?.response?.data?.message || "Failed to delete category";
                },
            });

            const apiResponse = await response;
            return {
                categoryId,
                response: apiResponse,
            };
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }
);

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllCategories.fulfilled, (state, action) => {
                const fetchedCategories =
                    action?.payload?.data?.data ||
                    action?.payload?.data;

                state.categoriesData = Array.isArray(fetchedCategories)
                    ? fetchedCategories
                    : [];
            })

            .addCase(createCategory.fulfilled, (state, action) => {
                const newCategory =
                    action?.payload?.data?.data ||
                    action?.payload?.data;

                if (newCategory && typeof newCategory === "object") {
                    state.categoriesData.push(newCategory);
                }
            })

            .addCase(updateCategory.fulfilled, (state, action) => {
                const updatedCategory =
                    action?.payload?.data?.data ||
                    action?.payload?.data;

                state.categoriesData = state.categoriesData.map((category) =>
                    category._id === updatedCategory._id
                        ? updatedCategory
                        : category
                );
            })

            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categoriesData = state.categoriesData.filter(
                    (category) =>
                        category._id !== action.payload.categoryId
                );
            });
    },
});

export default categorySlice.reducer;