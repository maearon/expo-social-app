"use client"
import { useEffect } from "react"
import { Stack, useRouter } from "expo-router"
import { Provider } from "react-redux"
import store from "../redux/store"
import { LogBox } from "react-native"
import useAuth from "../hooks/useAuth"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Ignore specific warnings
LogBox.ignoreLogs([
  "Warning: TNodeChildrenRenderer",
  "Warning: MemoizedTNodeRenderer",
  "Warning: TRenderEngineProvider",
])

const _layout = () => {
  return (
    <Provider store={store}>
      <MainLayout />
    </Provider>
  )
}

const MainLayout = () => {
  const { getCurrentUser, user, isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check authentication status when app starts
    const checkAuthStatus = async () => {
      try {
        // Check if we have a token in AsyncStorage
        const token = await AsyncStorage.getItem("token")

        if (token) {
          // If we have a token, try to get the current user
          const success = await getCurrentUser()

          if (success) {
            router.replace("/home")
          } else {
            // If getting user fails, redirect to welcome
            router.replace("/welcome")
          }
        } else {
          // No token, redirect to welcome
          router.replace("/welcome")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.replace("/welcome")
      }
    }

    checkAuthStatus()
  }, [])

  // Listen for changes in authentication state
  useEffect(() => {
    if (isLoggedIn && user) {
      router.replace("/home")
    } else if (!isLoggedIn && router.pathname !== "/welcome") {
      router.replace("/welcome")
    }
  }, [isLoggedIn, user])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="(main)/postDetails"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  )
}

export default _layout
