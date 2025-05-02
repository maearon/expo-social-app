"use client"

import { View, Text, StyleSheet, Pressable, Alert } from "react-native"
import { useRef, useState } from "react"
import ScreenWrapper from "../components/ScreenWrapper"
import { StatusBar } from "expo-status-bar"
import { hp, wp } from "../helpers/common"
import { theme } from "../constants/theme"
import BackButton from "../components/BackButton"
import { useRouter } from "expo-router"
import Button from "../components/Button"
import Icon from "../assets/icons"
import Input from "../components/Input"
import { useAppDispatch } from "../redux/hooks"
import { loginUser } from "../redux/session/sessionSlice"

const Login = () => {
  const emailRef = useRef<string>("")
  const passwordRef = useRef<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const dispatch = useAppDispatch()

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Login", "Please fill all the fields!")
      return
    }

    const email = emailRef.current.trim()
    const password = passwordRef.current.trim()

    setLoading(true)

    try {
      const resultAction = await dispatch(
        loginUser({
          email: email,
          password: password,
          remember_me: true, // Always remember on mobile
        }),
      )

      if (loginUser.fulfilled.match(resultAction)) {
        // Login successful
        router.replace("/home")
      } else if (loginUser.rejected.match(resultAction)) {
        // Login failed
        const errorMessage = resultAction.payload?.message || "Email or password incorrect"
        Alert.alert("Login", errorMessage)
      }
    } catch (error: any) {
      console.error("Login error:", error)
      Alert.alert("Login", error.message || "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenWrapper bg={"white"}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* back button */}
        <View>
          <BackButton router={router} />
        </View>

        {/* welcome */}
        <View>
          <Text style={styles.welcomeText}>Hey, </Text>
          <Text style={styles.welcomeText}>Welcome Back </Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>Please login to continue</Text>
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            placeholderTextColor={theme.colors.textLight}
            onChangeText={(value) => (emailRef.current = value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            secureTextEntry
            placeholder="Enter your password"
            placeholderTextColor={theme.colors.textLight}
            onChangeText={(value) => (passwordRef.current = value)}
          />
          <Text style={styles.forgotPassword}>Forgot Password?</Text>

          {/* button */}
          <Button title="Login" loading={loading} onPress={onSubmit} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push("/signUp")}>
            <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>
              Sign up
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
})

export default Login
