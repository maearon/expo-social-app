// Example of how to integrate the Redux logger with your store
import { configureStore } from "@reduxjs/toolkit"
import { createReduxLogger } from "./debug-utils"
import rootReducer from "./reducers" // Your existing reducers
import { Platform } from "react-native"

// Declare __DEV__ if it's not already defined (e.g., in a React Native environment)
declare const __DEV__: boolean

// Use Platform.OS === 'web' to check if the code is running in a web browser
const isWeb = Platform.OS === "web"

// Create the Redux store with conditional middleware for development
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: false, // Disable for development if needed
    })

    // Add the Redux logger in development
    if (__DEV__ && !isWeb) {
      middleware.push(createReduxLogger())
    }

    return middleware
  },
})

export default store
