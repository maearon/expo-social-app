/**
 * Debug utilities for React Native
 * Place this file in your services directory
 */

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean

// Enhanced logger for better debugging
export const logger = {
  info: (message: string, data?: any) => {
    if (__DEV__) {
      if (data) {
        console.log(`%c 📘 ${message}`, "color: #3498db; font-weight: bold", data)
      } else {
        console.log(`%c 📘 ${message}`, "color: #3498db; font-weight: bold")
      }
    }
  },

  error: (message: string, error?: any) => {
    if (__DEV__) {
      if (error) {
        console.error(`%c 🔴 ${message}`, "color: #e74c3c; font-weight: bold", error)
      } else {
        console.error(`%c 🔴 ${message}`, "color: #e74c3c; font-weight: bold")
      }
    }
  },

  warn: (message: string, data?: any) => {
    if (__DEV__) {
      if (data) {
        console.warn(`%c ⚠️ ${message}`, "color: #f39c12; font-weight: bold", data)
      } else {
        console.warn(`%c ⚠️ ${message}`, "color: #f39c12; font-weight: bold")
      }
    }
  },

  success: (message: string, data?: any) => {
    if (__DEV__) {
      if (data) {
        console.log(`%c ✅ ${message}`, "color: #2ecc71; font-weight: bold", data)
      } else {
        console.log(`%c ✅ ${message}`, "color: #2ecc71; font-weight: bold")
      }
    }
  },

  // Group logs for better organization
  group: (title: string, fn: () => void) => {
    if (__DEV__) {
      console.group(`%c ${title}`, "color: #9b59b6; font-weight: bold")
      fn()
      console.groupEnd()
    }
  },
}

// Function to monitor Redux actions
export const createReduxLogger = () => {
  return (store: any) => (next: any) => (action: any) => {
    if (__DEV__) {
      const actionType = action.type || "Unknown Action"

      logger.group(`REDUX ACTION: ${actionType}`, () => {
        console.log("Payload:", action.payload)
        console.log("Previous State:", store.getState())
        const result = next(action)
        console.log("Next State:", store.getState())
        return result
      })

      return next(action)
    } else {
      return next(action)
    }
  }
}

// Initialize all debug utilities
export const initializeDebugTools = () => {
  if (__DEV__) {
    // Setup global error handler if available
    try {
      const { ErrorUtils } = require("react-native")

      if (ErrorUtils && typeof ErrorUtils.getGlobalHandler === "function") {
        const originalErrorHandler = ErrorUtils.getGlobalHandler()

        ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
          logger.error(`Global Error${isFatal ? " (FATAL)" : ""}:`, error)
          originalErrorHandler(error, isFatal)
        })
      }
    } catch (e) {
      console.warn("Could not set up global error handler", e)
    }

    logger.info("Debug tools initialized")
  }
}

// Function to create a network monitor for debugging
export const createNetworkMonitor = () => {
  if (__DEV__) {
    // Monitor fetch requests
    const originalFetch = global.fetch
    global.fetch = async (...args) => {
      const [url, options = {}] = args
      const method = options.method || "GET"

      logger.info(`🌐 REQUEST: ${method} ${url.toString()}`, options.body)

      try {
        const response = await originalFetch(...args)
        const responseClone = response.clone()

        try {
          const data = await responseClone.json()
          logger.success(`🌐 RESPONSE: ${method} ${url.toString()} (${response.status})`, data)
        } catch (e) {
          logger.info(`🌐 RESPONSE: ${method} ${url.toString()} (${response.status})`, "Non-JSON response")
        }

        return response
      } catch (error) {
        logger.error(`🌐 ERROR: ${method} ${url.toString()}`, error)
        throw error
      }
    }

    logger.info("Network monitor initialized")
  }
}

import type { AxiosInstance } from "axios"

export const setupAxiosInterceptors = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use(
    (config) => {
      logger.info(`🌐 AXIOS REQUEST: ${config.method?.toUpperCase() || "GET"} ${config.url || ""}`, {
        headers: config.headers,
        data: config.data,
      })
      return config
    },
    (error) => {
      logger.error("AXIOS REQUEST ERROR", error)
      return Promise.reject(error)
    },
  )

  apiClient.interceptors.response.use(
    (response) => {
      logger.success(
        `🌐 AXIOS RESPONSE: ${response.config.method?.toUpperCase() || "GET"} ${response.config.url || ""} (${
          response.status
        })`,
        response.data,
      )
      return response
    },
    (error) => {
      if (error.response) {
        logger.error(
          `🌐 AXIOS RESPONSE ERROR: ${error.config?.method?.toUpperCase() || "GET"} ${error.config?.url || ""} (${
            error.response.status
          })`,
          error.response.data,
        )
      } else {
        logger.error("AXIOS ERROR", error)
      }
      return Promise.reject(error)
    },
  )
}
