import { configureStore } from "@reduxjs/toolkit";
import AuthSliceReducer from "./slices/authSlice";
import CategorySliceReducer from "./slices/categorySlice";
import BookSliceReducer from "./slices/bookSlice";
import ChapterSliceReducer from "./slices/chapterSlice";
import OrderSliceReducer from "./slices/orderSlice";
import WishlistSliceReducer from "./slices/wishlistSlice";
import CartSliceReducer from "./slices/cartSlice";

export const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,
        categories: CategorySliceReducer,
        books: BookSliceReducer,
        chapter: ChapterSliceReducer,
        order: OrderSliceReducer,
        wishlist: WishlistSliceReducer,
        cart:CartSliceReducer
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});