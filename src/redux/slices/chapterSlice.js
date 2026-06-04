import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    chaptersData: [],
};

export const createChapter = createAsyncThunk(
    "/chapters/createChapter",
    async (data) => {
        try {
            const response = axiosInstance.post("/chapters", data);

            toast.promise(response, {
                success: (resolvedPromise) => {
                    return (
                        resolvedPromise?.data?.message ||
                        "Chapter created successfully"
                    );
                },
                loading: "Creating chapter...",
                error: (err) => {
                    return err?.response?.data?.message || "Failed to create chapter";
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

export const getChapterById = createAsyncThunk(
    "/chapters/getChapterById",
    async (chapterId) => {
        try {
            const apiResponse = await axiosInstance.get(`/chapters/${chapterId}`);
            return apiResponse;
        } catch (error) {
            console.log(error);
        }
    }
);

export const getChaptersByBook = createAsyncThunk(
    "/chapters/getChaptersByBook",
    async (bookId) => {
        try {
            const apiResponse = await axiosInstance.get(`/chapters/book/${bookId}`);
            return apiResponse;
        } catch (error) {
            console.log(error);
        }
    }
);

export const updateChapter = createAsyncThunk(
    "/chapters/updateChapter",
    async ({ chapterId, data }) => {
        try {
            const response = axiosInstance.put(
                `/chapters/${chapterId}`,
                data
            );

            toast.promise(response, {
                loading: "Updating chapter...",
                success: "Chapter updated successfully",
                error: (err) => {
                    return err?.response?.data?.message || "Failed to update chapter";
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

const chapterSlice = createSlice({
    name: "chapter",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getChaptersByBook.fulfilled, (state, action) => {
                const fetchedChapters =
                    action?.payload?.data?.data ||
                    action?.payload?.data;

                state.chaptersData = Array.isArray(fetchedChapters)
                    ? fetchedChapters
                    : [];
            })

            .addCase(createChapter.fulfilled, (state, action) => {
                const newChapter =
                    action?.payload?.data?.data ||
                    action?.payload?.data;

                if (newChapter && typeof newChapter === "object") {
                    state.chaptersData.push(newChapter);
                }
            })

            .addCase(updateChapter.fulfilled, (state, action) => {
                const updatedChapter =
                    action?.payload?.data?.data ||
                    action?.payload?.data;

                state.chaptersData = state.chaptersData.map((chapter) =>
                    chapter._id === updatedChapter._id
                        ? updatedChapter
                        : chapter
                );
            });
    },
});

export default chapterSlice.reducer;