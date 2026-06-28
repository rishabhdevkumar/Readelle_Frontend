import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";
import { logActivity, logLoginIfNewSession } from "../../helpers/activityLogger";

const initialState = {
    isLoggedIn: false,
    role: "",
    data: {},
    usersData: [],
    isCheckingAuth: true, // Add loading state for initial auth check
};

export const registerUser = createAsyncThunk(
    "/auth/register",
    async (userData) => {
        try {
            const response = axiosInstance.post("/users/register", userData);

            toast.promise(response, {
                loading: "Creating account...",
                success: (resolvedPromise) =>
                    resolvedPromise?.data?.message ||
                    "Account created successfully",
                error: "Failed to create account",
            });

            const apiResponse = await response;
            return apiResponse;
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }
);


export const loginUser = createAsyncThunk(
    "auth/login", // Kuch projects mein slash se shuru karne par issues aate hain, use "auth/login"
    async (loginData, thunkAPI) => {
        try {
            // Hum yahan direct 'await' use karenge aur toast.promise hata denge
            const response = await axiosInstance.post("/users/login", loginData);
            
            // Hamesha response ka direct data return karein taaki payload structure predictable rahe
            return response.data; 
        } catch (error) {
            console.error(error);
            // Agar backend custom message bhej raha hai to use pass karein
            const errorMessage = error?.response?.data?.message || error?.response?.data || error.message;
            return thunkAPI.rejectWithValue(errorMessage);
        }
    }
);

export const getMe = createAsyncThunk(
    "/auth/me",
    async () => {
        try {
            const response = axiosInstance.get("/users/me");

            const apiResponse = await response;
            return apiResponse;
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch profile");
        }
    }
);

export const getAllUsers = createAsyncThunk(
    "/auth/getAllUsers",
    async () => {
        try {
            const apiResponse = await axiosInstance.get("/users");
            return apiResponse;
        } catch (error) {
            console.log(error);
        }
    }
);

export const updateUser = createAsyncThunk(
    "/auth/updateUser",
    async ({ id, data }) => {
        try {
            const response = axiosInstance.put(`/users/${id}`, data);

            toast.promise(response, {
                loading: "Updating user...",
                success: "User updated successfully",
                error: (err) => {
                    return err?.response?.data?.message || "Failed to update user";
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

export const deleteUser = createAsyncThunk(
    "/auth/deleteUser",
    async (userId) => {
        try {
            const response = axiosInstance.delete(`/users/${userId}`);

            toast.promise(response, {
                loading: "Deleting user...",
                success: "User deleted successfully",
                error: (err) => {
                    return err?.response?.data?.message || "Failed to delete user";
                },
            });

            const apiResponse = await response;
            return {
                userId,
                response: apiResponse,
            };
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.isLoggedIn = false;
            state.role = "";
            state.data = {};
            state.usersData = [];
            state.isCheckingAuth = false;

            localStorage.removeItem("token");
        },
        setAuthCheckComplete: (state) => {
            state.isCheckingAuth = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                const payload = action?.payload?.data;

                const token =
                    payload?.token ||
                    payload?.accessToken ||
                    payload?.access_token ||
                    payload?.data?.token ||
                    payload?.data?.accessToken;

                const userData =
                    payload?.data ||
                    payload?.user ||
                    payload?.userData ||
                    payload;

                console.log("[Auth] login response payload:", payload);
                console.log("[Auth] extracted token:", token);
                console.log("[Auth] extracted user:", userData);

                if (token) {
                    localStorage.setItem("token", token);
                } else {
                    console.warn("[Auth] No token found in login response. Check backend response shape.");
                }

                state.isLoggedIn = true;
                state.role = userData?.role || "";
                state.data = userData || {};
                state.isCheckingAuth = false;
                // Log sign-in activity
                logActivity("login", "Signed in", "Account");
            })

            .addCase(getMe.fulfilled, (state, action) => {
                const userData =
                    action?.payload?.data?.data ||
                    action?.payload?.data;

                if (userData && userData.status && userData.status !== "Active") {
                    state.isLoggedIn = false;
                    state.role = "";
                    state.data = {};
                    state.isCheckingAuth = false;
                    localStorage.removeItem("token");
                    toast.error("Your account is deactivated or suspended. Please contact the administrator.");
                } else {
                    state.isLoggedIn = true;
                    state.role = userData?.role || "";
                    state.data = userData || {};
                    state.isCheckingAuth = false;
                    // Track session — won't duplicate if logged in < 1hr ago
                    logLoginIfNewSession();
                }
            })

            .addCase(getMe.rejected, (state) => {
                state.isLoggedIn = false;
                state.role = "";
                state.data = {};
                state.isCheckingAuth = false;
            })

            .addCase(getAllUsers.fulfilled, (state, action) => {
                const fetchedUsers = action?.payload?.data?.data || action?.payload?.data;
                state.usersData = Array.isArray(fetchedUsers) ? fetchedUsers : [];
            })

            .addCase(updateUser.fulfilled, (state, action) => {
                const updatedUser = action?.payload?.data?.data || action?.payload?.data;
                if (updatedUser && updatedUser._id) {
                    state.usersData = state.usersData.map((user) =>
                        user._id === updatedUser._id ? updatedUser : user
                    );
                }
            })

            .addCase(deleteUser.fulfilled, (state, action) => {
                if (action.payload && action.payload.userId) {
                    state.usersData = state.usersData.filter(
                        (user) => user._id !== action.payload.userId
                    );
                }
            });
    },
});

export const { logout, setAuthCheckComplete } = authSlice.actions;

export default authSlice.reducer;