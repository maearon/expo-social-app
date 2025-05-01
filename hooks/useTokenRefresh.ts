"use client"

import { useEffect, useCallback, useRef } from "react"
import { useDispatch } from "react-redux"
import { setTokens } from "../redux/session/sessionSlice"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { logger } from "../services/debug-utils"
import ApiService from "../services"
import type { AppDispatch } from "../redux/store"

interface UseTokenRefreshOptions {
  refreshInterval?: number // in milliseconds
  onRefreshSuccess?: (tokens: { accessToken: string; refreshToken?: string }) => void
  onRefreshError?: (error: any) => void
}

/**
 * Custom hook for automatic token refresh
 * @param options Options for token refresh
 * @returns Object with refresh function and status
 */
export const useTokenRefresh = (options: UseTokenRefreshOptions = {}) => {
  const { refreshInterval = 15 * 60 * 1000, onRefreshSuccess, onRefreshError } = options
  const dispatch = useDispatch<AppDispatch>()
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)

  // Function to refresh the token
  const refreshToken = useCallback(async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshingRef.current) {
      return { success: false, error: "Token refresh already in progress" }
    }

    try {
      isRefreshingRef.current = true
      const refreshToken = await AsyncStorage.getItem("remember_token")

      if (!refreshToken) {
        return { success: false, error: "No refresh token available" }
      }

      // Call your API to refresh the token
      const response = await ApiService.post("/refresh-token", { token: refreshToken })

      if (response && response.tokens) {
        const newTokens = {
          accessToken: response.tokens.access.token,
          refreshToken: response.tokens.refresh?.token,
        }

        // Update Redux store and AsyncStorage
        dispatch(setTokens(newTokens))

        if (onRefreshSuccess) {
          onRefreshSuccess(newTokens)
        }

        return { success: true, tokens: newTokens }
      } else {
        throw new Error("Invalid response from refresh token endpoint")
      }
    } catch (error) {
      logger.error("Token refresh failed:", error)

      if (onRefreshError) {
        onRefreshError(error)
      }

      return { success: false, error }
    } finally {
      isRefreshingRef.current = false
    }
  }, [dispatch, onRefreshSuccess, onRefreshError])

  // Setup periodic token refresh
  useEffect(() => {
    const setupRefreshTimer = async () => {
      // Clear any existing timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }

      // Check if we have a token to refresh
      const token = await AsyncStorage.getItem("token")
      if (!token) return

      // Set up the refresh timer
      refreshTimerRef.current = setInterval(refreshToken, refreshInterval)
    }

    setupRefreshTimer()

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [refreshInterval, refreshToken])

  return {
    refreshToken,
    isRefreshing: isRefreshingRef.current,
  }
}

export default useTokenRefresh
