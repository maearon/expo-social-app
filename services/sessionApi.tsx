import API from "."
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { User } from "../redux/session/sessionSlice"

export interface SessionParams {
  session: LoginField
}

export interface LoginField {
  email: string
  password: string
  remember_me: string
}

export interface Response<T> {
  type?: string
  currentAuthority?: string
  user?: T
  tokens?: {
    access: {
      token: string
      expires: string
    }
    refresh: {
      token: string
      expires: string
    }
  }
  flash?: [message_type: string, message: string]
  error?: string[]
  status?: number
  message?: string
  errors?: {
    [key: string]: string[]
  }
}

/**
 * Session API service
 * Provides methods for user authentication
 */
const sessionApi = {
  /**
   * Login user
   * @param params Login credentials
   * @returns Promise with user data and tokens
   */
  async create(params: SessionParams): Promise<Response<User>> {
    const url = "/login"

    try {
      // Using the enhanced API service
      const response = await API.post(url, params)

      // Store tokens in AsyncStorage if login is successful
      if (response?.tokens?.access?.token) {
        await AsyncStorage.setItem("token", response.tokens.access.token)

        if (response.tokens.refresh?.token) {
          await AsyncStorage.setItem("remember_token", response.tokens.refresh.token)
        }
      }

      return response
    } catch (error: any) {
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          status: error.response.status,
          message: error.response.data?.message || "Login failed",
          errors: error.response.data?.errors || {},
        }
      } else if (error.request) {
        // The request was made but no response was received
        return {
          status: 0,
          message: "No response from server. Please check your connection.",
          errors: {},
        }
      } else {
        // Something happened in setting up the request
        return {
          status: 0,
          message: error.message || "An unexpected error occurred",
          errors: {},
        }
      }
    }
  },

  /**
   * Logout user
   * @returns Promise with logout result
   */
  async destroy(): Promise<any> {
    const url = "/logout"

    try {
      // Using the enhanced API service
      const response = await API.delete(url)

      // Clear tokens from AsyncStorage on logout
      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("remember_token")

      return response
    } catch (error: any) {
      // Even if the API call fails, we should still clear local tokens
      try {
        await AsyncStorage.removeItem("token")
        await AsyncStorage.removeItem("remember_token")
      } catch (storageError) {
        console.error("Failed to clear tokens from storage", storageError)
      }

      // Return error information
      if (error.response) {
        return {
          status: error.response.status,
          message: error.response.data?.message || "Logout failed",
          errors: error.response.data?.errors || {},
        }
      } else {
        return {
          status: 0,
          message: error.message || "An unexpected error occurred during logout",
          errors: {},
        }
      }
    }
  },

  /**
   * Check if user is currently authenticated
   * @returns Promise<boolean>
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem("token")
      return !!token
    } catch (error) {
      console.error("Error checking authentication status", error)
      return false
    }
  },
}

export default sessionApi
