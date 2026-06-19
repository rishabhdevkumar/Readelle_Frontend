import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    notesData: [],
    isLoading: false,
};

// Create a note
export const createNote = createAsyncThunk(
    "/notes/createNote",
    async (data) => {
        try {
            const response = axiosInstance.post("/notes", data);
            toast.promise(response, {
                loading: "Saving note...",
                success: (res) => res?.data?.message || "Note saved!",
                error: (err) => err?.response?.data?.message || "Failed to save note",
            });
            return await response;
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }
);

// Get all notes
export const getAllNotes = createAsyncThunk(
    "/notes/getAllNotes",
    async () => {
        try {
            const apiResponse = await axiosInstance.get("/notes");
            return apiResponse;
        } catch (error) {
            console.log(error);
        }
    }
);

// Get notes by bookId and chapterId
export const getNotesByBookAndChapter = createAsyncThunk(
    "/notes/getNotesByBookAndChapter",
    async ({ bookId, chapterId }) => {
        try {
            const apiResponse = await axiosInstance.get(
                `/notes/book/${bookId}/chapter/${chapterId}`
            );
            return apiResponse;
        } catch (error) {
            console.log(error);
        }
    }
);

// Update a note
export const updateNote = createAsyncThunk(
    "/notes/updateNote",
    async ({ noteId, data }) => {
        try {
            const response = axiosInstance.put(`/notes/${noteId}`, data);
            toast.promise(response, {
                loading: "Updating note...",
                success: "Note updated!",
                error: (err) => err?.response?.data?.message || "Failed to update note",
            });
            return await response;
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }
);

// Delete a note
export const deleteNote = createAsyncThunk(
    "/notes/deleteNote",
    async (noteId) => {
        try {
            const response = axiosInstance.delete(`/notes/${noteId}`);
            toast.promise(response, {
                loading: "Deleting note...",
                success: "Note deleted!",
                error: (err) => err?.response?.data?.message || "Failed to delete note",
            });
            await response;
            return noteId;
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }
);

const notesSlice = createSlice({
    name: "notes",
    initialState,
    reducers: {
        clearNotes(state) {
            state.notesData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // getAllNotes
            .addCase(getAllNotes.pending, (state) => { state.isLoading = true; })
            .addCase(getAllNotes.fulfilled, (state, action) => {
                state.isLoading = false;
                const data = action?.payload?.data?.data || action?.payload?.data;
                state.notesData = Array.isArray(data) ? data : [];
            })
            .addCase(getAllNotes.rejected, (state) => { state.isLoading = false; })

            // getNotesByBookAndChapter
            .addCase(getNotesByBookAndChapter.pending, (state) => { state.isLoading = true; })
            .addCase(getNotesByBookAndChapter.fulfilled, (state, action) => {
                state.isLoading = false;
                const data = action?.payload?.data?.data || action?.payload?.data;
                state.notesData = Array.isArray(data) ? data : [];
            })
            .addCase(getNotesByBookAndChapter.rejected, (state) => { state.isLoading = false; })

            // createNote
            .addCase(createNote.fulfilled, (state, action) => {
                const newNote = action?.payload?.data?.data || action?.payload?.data;
                if (newNote && typeof newNote === "object") {
                    state.notesData.push(newNote);
                }
            })

            // updateNote
            .addCase(updateNote.fulfilled, (state, action) => {
                const updated = action?.payload?.data?.data || action?.payload?.data;
                if (updated && updated._id) {
                    state.notesData = state.notesData.map((n) =>
                        n._id === updated._id ? updated : n
                    );
                }
            })

            // deleteNote
            .addCase(deleteNote.fulfilled, (state, action) => {
                const noteId = action.payload;
                if (noteId) {
                    state.notesData = state.notesData.filter((n) => n._id !== noteId);
                }
            });
    },
});

export const { clearNotes } = notesSlice.actions;
export default notesSlice.reducer;
