"use client"

import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchUser,
  selectUser,
} from "../redux/session/sessionSlice"
import type { AppDispatch } from "../redux/store"

// Custom hook for authentication
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>()

  // Selectors
  const user = useSelector(selectUser)


  return {
    user
  }
}

export default useAuth
