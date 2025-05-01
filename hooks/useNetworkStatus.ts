"use client"

import { useState, useEffect, useCallback } from "react"
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo"

interface UseNetworkStatusOptions {
  onConnect?: () => void
  onDisconnect?: () => void
}

/**
 * Custom hook for monitoring network connectivity
 * @param options Options for network status monitoring
 * @returns Object with network status information
 */
export const useNetworkStatus = (options: UseNetworkStatusOptions = {}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [connectionType, setConnectionType] = useState<string | null>(null)
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null)
  const [details, setDetails] = useState<any>(null)

  const handleConnectivityChange = useCallback(
    (state: NetInfoState) => {
      const wasConnected = isConnected
      const nowConnected = state.isConnected

      setIsConnected(state.isConnected)
      setConnectionType(state.type)
      setIsInternetReachable(state.isInternetReachable)
      setDetails(state.details)

      // Call callbacks if connection state changed
      if (wasConnected !== null) {
        if (!wasConnected && nowConnected && options.onConnect) {
          options.onConnect()
        } else if (wasConnected && !nowConnected && options.onDisconnect) {
          options.onDisconnect()
        }
      }
    },
    [isConnected, options],
  )

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(handleConnectivityChange)

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange)

    return () => {
      unsubscribe()
    }
  }, [handleConnectivityChange])

  // Check connectivity manually
  const checkConnection = useCallback(async () => {
    const state = await NetInfo.fetch()
    handleConnectivityChange(state)
    return state
  }, [handleConnectivityChange])

  return {
    isConnected,
    connectionType,
    isInternetReachable,
    details,
    checkConnection,
  }
}

export default useNetworkStatus
