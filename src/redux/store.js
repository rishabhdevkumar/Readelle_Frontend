import { configureStore } from "@reduxjs/toolkit";
import AuthSliceReducer from "./slices/authSlice";
import CategorySliceReducer from "./slices/categorySlice";
import BookSliceReducer from "./slices/bookSlice";
import ChapterSliceReducer from "./slices/chapterSlice";
import WishlistSliceReducer from "./slices/wishlistSlice";
import CartSliceReducer from "./slices/cartSlice";
import NotesSliceReducer from "./slices/notesSlice";
import OrderSliceReducer from "./slices/orderSlice";
import BookmarkSliceReducer from "./slices/bookmarkSlice";
import ProgressSliceReducer from "./slices/progressSlice";
import HighlightSliceReducer from "./slices/highlightSlice";
import RatingSliceReducer from "./slices/ratingSlice";

export const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,
        categories: CategorySliceReducer,
        books: BookSliceReducer,
        chapter: ChapterSliceReducer,
        order: OrderSliceReducer,
        wishlist: WishlistSliceReducer,
        cart: CartSliceReducer,
        notes: NotesSliceReducer,
        bookmarks: BookmarkSliceReducer,
        progress: ProgressSliceReducer,
        highlights: HighlightSliceReducer,
        ratings: RatingSliceReducer
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});