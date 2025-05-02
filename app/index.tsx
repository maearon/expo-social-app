"use client"

import { View } from "react-native"
import { useEffect } from "react"
import Loading from "../components/Loading"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAppDispatch } from "../redux/hooks"
import { fetchUser } from "../redux/session/sessionSlice"

const StartPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if we have a token in AsyncStorage
        const token = await AsyncStorage.getItem("token")

        if (token) {
          // If we have a token, try to get the current user
          try {
            await dispatch(fetchUser())
            router.replace("/home")
          } catch (error) {
            console.error("Error fetching user:", error)
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
  }, [dispatch, router])

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Loading />
    </View>
  )
}

export default StartPage
