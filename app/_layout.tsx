import { useEffect } from "react"
import { Stack, useRouter } from "expo-router"
import { Provider } from "react-redux"
import store from "../redux/store"
import { LogBox } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { fetchUser, selectIsLoggedIn, selectUser } from "../redux/session/sessionSlice"

// Ignore specific warnings
LogBox.ignoreLogs([
  "Warning: TNodeChildrenRenderer",
  "Warning: MemoizedTNodeRenderer",
  "Warning: TRenderEngineProvider",
])

const RootLayout = () => {
  return (
    <Provider store={store}>
      <MainLayout />
    </Provider>
  )
}

const MainLayout = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const user = useAppSelector(selectUser)
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Check authentication status when app starts
    const checkAuthStatus = async () => {
      try {
        // Check if we have a token in AsyncStorage
        const token = await AsyncStorage.getItem("token")

        if (token) {
          // If we have a token, try to get the current user
          await dispatch(fetchUser())
        }
      } catch (error) {
        console.error("Auth check error:", error)
      }
    }

    checkAuthStatus()
  }, [dispatch])

  // Listen for changes in authentication state
  useEffect(() => {
    if (isLoggedIn && user) {
      // If the user is logged in and we have user data, navigate to home
      if (router.pathname === "/welcome" || router.pathname === "/login" || router.pathname === "/signUp") {
        router.replace("/home")
      }
    } else if (
      !isLoggedIn &&
      router.pathname !== "/welcome" &&
      router.pathname !== "/login" &&
      router.pathname !== "/signUp" &&
      router.pathname !== "/"
    ) {
      // If the user is not logged in and not on an auth screen, redirect to welcome
      router.replace("/welcome")
    }
  }, [isLoggedIn, user, router.pathname])

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

export default RootLayout
