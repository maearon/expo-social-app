import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === "development" // React Native's built-in development flag

// Enhanced logger for better debugging
const logger = {
  info: (message: string, data?: any) => {
    if (isDev) {
      if (data) {
        console.log(`%c 📘 ${message}`, "color: #3498db; font-weight: bold", data)
      } else {
        console.log(`%c 📘 ${message}`, "color: #3498db; font-weight: bold")
      }
    }
  },
  error: (message: string, error?: any) => {
    if (isDev) {
      if (error) {
        console.error(`%c 🔴 ${message}`, "color: #e74c3c; font-weight: bold", error)
      } else {
        console.error(`%c 🔴 ${message}`, "color: #e74c3c; font-weight: bold")
      }
    }
  },
  success: (message: string, data?: any) => {
    if (isDev) {
      if (data) {
        console.log(`%c ✅ ${message}`, "color: #2ecc71; font-weight: bold", data)
      } else {
        console.log(`%c ✅ ${message}`, "color: #2ecc71; font-weight: bold")
      }
    }
  },
}

let BASE_URL = ""
if (process.env.NODE_ENV === "development") {
  // http://localhost:3001/api
  BASE_URL = "https://ruby-rails-boilerplate-3s9t.onrender.com/api"
} else {
  BASE_URL = "https://ruby-rails-boilerplate-3s9t.onrender.com/api"
}

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-lang": "EN",
  },
  timeout: 15000, // Add a reasonable timeout
})

// Enhanced request interceptor with debugging
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token")
      const rememberToken = await AsyncStorage.getItem("remember_token")

      if (token) {
        if (config.headers) {
          config.headers.set(
            "Authorization",
            `Bearer ${token} ${rememberToken || ""}`
          )
        }
      }

      // Debug logging in development
      if (isDev) {
        const method = config.method?.toUpperCase() || "GET"
        const url = config.url || ""
        logger.info(`🚀 API Request: ${method} ${url}`, {
          headers: config.headers,
          params: config.params,
          data: config.data,
        })
      }
    } catch (error) {
      logger.error("Error reading token from AsyncStorage", error)
    }
    return config
  },
  (error) => {
    logger.error("Request interceptor error", error)
    return Promise.reject(error)
  },
)

// Enhanced response interceptor with debugging
API.interceptors.response.use(
  (response: AxiosResponse) => {
    // Debug logging in development
    if (isDev) {
      const method = response.config.method?.toUpperCase() || "GET"
      const url = response.config.url || ""
      logger.success(`✅ API Response: ${method} ${url}`, {
        status: response.status,
        data: response.data,
      })
    }
    return response.data
  },
  (error) => {
    // Enhanced error logging
    if (isDev) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const method = error.config?.method?.toUpperCase() || "GET"
        const url = error.config?.url || ""
        logger.error(`❌ API Error ${error.response.status}: ${method} ${url}`, {
          data: error.response.data,
          headers: error.response.headers,
        })
      } else if (error.request) {
        // The request was made but no response was received
        const method = error.config?.method?.toUpperCase() || "GET"
        const url = error.config?.url || ""
        logger.error(`❌ API No Response: ${method} ${url}`, {
          request: error.request,
        })
      } else {
        // Something happened in setting up the request that triggered an Error
        logger.error("API Error", error.message)
      }
    }
    return Promise.reject(error)
  },
)

// Helper methods for common API operations
const ApiService = {
  get: async (url: string, params?: any) => {
    try {
      return await API.get(url, { params })
    } catch (error) {
      throw error
    }
  },

  post: async (url: string, data: any, config?: AxiosRequestConfig) => {
    try {
      return await API.post(url, data, config)
    } catch (error) {
      throw error
    }
  },

  put: async (url: string, data: any) => {
    try {
      return await API.put(url, data)
    } catch (error) {
      throw error
    }
  },

  delete: async (url: string) => {
    try {
      return await API.delete(url)
    } catch (error) {
      throw error
    }
  },

  // Method to test API connectivity - useful for debugging
  testConnection: async () => {
    try {
      const response = await API.get("/health-check")
      logger.success("API connection test successful", response)
      return { success: true, data: response }
    } catch (error) {
      logger.error("API connection test failed", error)
      return { success: false, error }
    }
  },
}

// For backward compatibility, export the API instance directly
export { API }

// Export the enhanced API service as the default export
export default ApiService
