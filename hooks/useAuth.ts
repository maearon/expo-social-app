"use client"

import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  loginUser,
  logoutUser,
  fetchUser,
  selectUser,
  selectIsLoggedIn,
  selectSessionStatus,
  selectSessionError,
  clearError,
} from "../redux/session/sessionSlice"
import type { AppDispatch } from "../redux/store"

// Custom hook for authentication
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>()

  // Selectors
  const user = useSelector(selectUser)
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const status = useSelector(selectSessionStatus)
  const error = useSelector(selectSessionError)

  // Login function
  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      try {
        const resultAction = await dispatch(
          loginUser({
            email,
            password,
            remember_me: rememberMe,
          }),
        )

        if (loginUser.fulfilled.match(resultAction)) {
          return { success: true, user: resultAction.payload.user }
        } else {
          const payload = resultAction.payload as { message?: string }
          return {
            success: false,
            error: payload?.message || "Login failed",
          }
        }
      } catch (error: any) {
        return { success: false, error: error.message || "An unexpected error occurred" }
      }
    },
    [dispatch],
  )

  // Logout function
  const logout = useCallback(async () => {
    await dispatch(logoutUser())
  }, [dispatch])

  // Get current user function
  const getCurrentUser = useCallback(async () => {
    try {
      const resultAction = await dispatch(fetchUser())
      return fetchUser.fulfilled.match(resultAction)
    } catch (error) {
      return false
    }
  }, [dispatch])

  // Clear error function
  const resetError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    user,
    isLoggedIn,
    status,
    error,
    login,
    logout,
    getCurrentUser,
    resetError,
    isLoading: status === "loading",
  }
}

export default useAuth
