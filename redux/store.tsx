import { configureStore, type ThunkAction, type Action } from "@reduxjs/toolkit"
import sessionReducer from "./session/sessionSlice"
import { createReduxLogger } from "../services/debug-utils"
import { Platform } from "react-native"

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === "development"

// Check if running on web (for different debugging approaches)
const isWeb = Platform.OS === "web"

// Configure the Redux store with only session management
export const store = configureStore({
  reducer: {
    session: sessionReducer,
    // No other reducers - only managing session state
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: ["session.error"],
      },
    })

    // Add the Redux logger in development mode
    if (isDev && !isWeb) {
      middleware.push(createReduxLogger())
    }

    return middleware
  },
  devTools: isDev,
})

// Export types for TypeScript
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>

export default store
