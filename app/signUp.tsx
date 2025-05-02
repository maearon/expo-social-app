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
import ApiService from "../services"

const SignUp = () => {
  const emailRef = useRef<string>("")
  const nameRef = useRef<string>("")
  const passwordRef = useRef<string>("")
  const passwordConfirmationRef = useRef<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const router = useRouter()

  const onSubmit = async () => {
    if (!nameRef.current || !emailRef.current || !passwordRef.current || !passwordConfirmationRef.current) {
      Alert.alert("Sign up", "Please fill all the fields!")
      return
    }

    if (passwordRef.current !== passwordConfirmationRef.current) {
      Alert.alert("Sign up", "Passwords do not match!")
      return
    }

    const name = nameRef.current.trim()
    const email = emailRef.current.trim()
    const password = passwordRef.current.trim()
    const password_confirmation = passwordConfirmationRef.current.trim()

    setLoading(true)

    try {
      // Call the Rails API to register a new user
      const response = await ApiService.post("/signup", {
        user: {
          name,
          email,
          password,
          password_confirmation,
        },
      })

      if (response && response.user) {
        Alert.alert("Success", "Account created successfully! Please login.", [
          {
            text: "OK",
            onPress: () => router.push("/login"),
          },
        ])
      } else if (response && response.errors) {
        // Format and display errors
        const errorMessages = Object.entries(response.errors)
          .map(([key, errors]) => `${key} ${errors.join(", ")}`)
          .join("\n")
        Alert.alert("Sign up failed", errorMessages)
      }
    } catch (error: any) {
      console.error("Sign up error:", error)
      Alert.alert("Sign up", error.message || "An error occurred during sign up")
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
          <Text style={styles.welcomeText}>Let's </Text>
          <Text style={styles.welcomeText}>Get Started</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please fill the details to create an account
          </Text>
          <Input
            icon={<Icon name="user" size={26} strokeWidth={1.6} />}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.textLight}
            onChangeText={(value) => (nameRef.current = value)}
          />
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
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            secureTextEntry
            placeholder="Confirm your password"
            placeholderTextColor={theme.colors.textLight}
            onChangeText={(value) => (passwordConfirmationRef.current = value)}
          />

          {/* button */}
          <Button title="Sign up" loading={loading} onPress={onSubmit} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account!</Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>
              Login
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

export default SignUp
