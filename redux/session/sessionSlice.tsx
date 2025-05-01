import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import sessionApi from "../../services/sessionApi"
import ApiService from "../../services"
import type { RootState } from "../store"
import AsyncStorage from "@react-native-async-storage/async-storage"

// User interface with proper typing
export interface User {
  readonly id: string
  email: string
  name: string
  role: boolean
  avatar?: string
  phoneNumber?: string
  address?: string
  bio?: string
  image?: string | null
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

// Session state interface
export interface UserState {
  loggedIn: boolean
  value: User | null
  status: "idle" | "loading" | "failed"
  error: string | null
  tokens: {
    accessToken: string | null
    refreshToken: string | null
  }
}

// Initial state with proper null values
const initialState: UserState = {
  loggedIn: false,
  value: null,
  status: "idle",
  error: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
}

// Login credentials interface
interface LoginCredentials {
  email: string
  password: string
  remember_me: boolean | string
}

// Async thunk for fetching current user
export const fetchUser = createAsyncThunk("session/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await ApiService.get("/sessions")
    return response
  } catch (error: any) {
    // Enhanced error handling
    if (error.response) {
      return rejectWithValue({
        status: error.response.status,
        message: error.response.data?.message || "Failed to fetch user",
      })
    }
    return rejectWithValue({
      status: 0,
      message: error.message || "Network error",
    })
  }
})

// Async thunk for user login
export const loginUser = createAsyncThunk(
  "session/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await sessionApi.create({
        session: {
          email: credentials.email,
          password: credentials.password,
          remember_me:
            typeof credentials.remember_me === "boolean"
              ? credentials.remember_me
                ? "true"
                : "false"
              : credentials.remember_me,
        },
      })

      // Check for error response
      if (response.status && response.status !== 200) {
        return rejectWithValue({
          status: response.status,
          message: response.message || "Login failed",
          errors: response.errors,
        })
      }

      return response
    } catch (error: any) {
      return rejectWithValue({
        status: 0,
        message: error.message || "An unexpected error occurred",
      })
    }
  },
)

// Async thunk for user logout
export const logoutUser = createAsyncThunk("session/logout", async (_, { rejectWithValue }) => {
  try {
    await sessionApi.destroy()
    return { success: true }
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || "Logout failed",
    })
  }
})

// Session slice with enhanced functionality
export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    // Clear error state
    clearError: (state) => {
      state.error = null
    },

    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.value) {
        state.value = { ...state.value, ...action.payload }
      }
    },

    // Set tokens manually (useful for token refresh)
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) => {
      state.tokens.accessToken = action.payload.accessToken
      if (action.payload.refreshToken) {
        state.tokens.refreshToken = action.payload.refreshToken
      }

      // Also store in AsyncStorage
      AsyncStorage.setItem("token", action.payload.accessToken)
      if (action.payload.refreshToken) {
        AsyncStorage.setItem("remember_token", action.payload.refreshToken)
      }
    },
  },
  extraReducers: (builder) => {
    // Handle fetchUser actions
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "idle"
        state.loggedIn = true
        state.value = action.payload.user
        state.error = null
      })
      .addCase(fetchUser.rejected, (state, action: PayloadAction<any>) => {
        state.status = "failed"
        state.loggedIn = false
        state.value = null
        state.error = action.payload?.message || "Failed to fetch user"
      })

    // Handle loginUser actions
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "idle"
        state.loggedIn = true
        state.value = action.payload.user
        state.error = null

        // Store tokens
        if (action.payload.tokens?.access?.token) {
          state.tokens.accessToken = action.payload.tokens.access.token
        }
        if (action.payload.tokens?.refresh?.token) {
          state.tokens.refreshToken = action.payload.tokens.refresh.token
        }
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.status = "failed"
        state.loggedIn = false
        state.error = action.payload?.message || "Login failed"
      })

    // Handle logoutUser actions
    builder
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading"
      })
      .addCase(logoutUser.fulfilled, (state) => {
        // Reset to initial state on logout
        return {
          ...initialState,
          status: "idle",
        }
      })
      .addCase(logoutUser.rejected, (state, action: PayloadAction<any>) => {
        // Even if API logout fails, we should still clear local state
        return {
          ...initialState,
          status: "failed",
          error: action.payload?.message || "Logout failed, but local session was cleared",
        }
      })
  },
})

// Export actions
export const { clearError, updateUserProfile, setTokens } = sessionSlice.actions

// Selectors
export const selectUser = (state: RootState) => state.session.value
export const selectIsLoggedIn = (state: RootState) => state.session.loggedIn
export const selectSessionStatus = (state: RootState) => state.session.status
export const selectSessionError = (state: RootState) => state.session.error
export const selectTokens = (state: RootState) => state.session.tokens

export default sessionSlice.reducer
