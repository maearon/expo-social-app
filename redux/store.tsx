import { configureStore, type ThunkAction, type Action } from "@reduxjs/toolkit"
import sessionReducer from "./session/sessionSlice"
import postsReducer from "./posts/postsSlice"
import notificationsReducer from "./notifications/notificationsSlice"
import micropostsReducer from "./microposts/micropostsSlice"
import { createReduxLogger } from "../services/debug-utils"
import { Platform } from "react-native"

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === "development"

// Check if running on web (for different debugging approaches)
const isWeb = Platform.OS === "web"

// Configure the Redux store with enhanced debugging
export const store = configureStore({
  reducer: {
    session: sessionReducer,
    posts: postsReducer,
    notifications: notificationsReducer,
    microposts: micropostsReducer,
    // Add other reducers here as your app grows
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      // Configure serializable check to ignore certain paths
      serializableCheck: {
        // Ignore these action types (useful for actions with non-serializable data)
        ignoredActions: ["persist/PERSIST"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["session.error"],
        // Disable thunk middleware warnings in development
        warnAfter: 128,
      },
      immutableCheck: { warnAfter: 128 },
    })

    // Add the Redux logger in development mode
    if (isDev) {
      // Don't add the logger when running on web to avoid console clutter
      if (!isWeb) {
        middleware.push(createReduxLogger())
      }
    }

    return middleware
  },
  // Enable Redux DevTools in development
  devTools: isDev,
})

// Setup debug listeners for Redux actions in development
if (isDev && !isWeb) {
  store.subscribe(() => {
    // You can add custom logging here if needed
    // This runs after every action
  })
}

// Export types for TypeScript
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>

export default store
