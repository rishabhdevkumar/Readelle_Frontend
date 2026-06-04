import { configureStore } from "@reduxjs/toolkit";
import AuthSliceReducer from "./slices/authSlice";
import CategorySliceReducer from "./slices/categorySlice";
import BookSliceReducer from "./slices/bookSlice";
import ChapterSliceReducer from "./slices/chapterSlice";

export const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,
        category: CategorySliceReducer,
        book: BookSliceReducer,
        chapter: ChapterSliceReducer,
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});