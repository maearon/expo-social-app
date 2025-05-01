"use client"

import { StyleSheet, TouchableOpacity, Text, Alert } from "react-native"
import { useState } from "react"
import * as ImagePicker from "expo-image-picker"
import * as DocumentPicker from "expo-document-picker"
import { theme } from "../constants/theme"
import { hp } from "../helpers/common"
import Icon from "../assets/icons"

const MediaPicker = ({ onMediaSelected, type = "all", buttonText = "Select Media" }) => {
  const [loading, setLoading] = useState(false)

  // Request permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert("Permissions Required", "Please grant camera and media library permissions to use this feature.", [
        { text: "OK" },
      ])
      return false
    }
    return true
  }

  // Pick image from camera
  const takePhoto = async () => {
    if (!(await requestPermissions())) return

    try {
      setLoading(true)
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onMediaSelected(result.assets[0])
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "Failed to take photo")
    } finally {
      setLoading(false)
    }
  }

  // Pick image from library
  const pickImage = async () => {
    if (!(await requestPermissions())) return

    try {
      setLoading(true)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          type === "all"
            ? ImagePicker.MediaTypeOptions.All
            : type === "image"
              ? ImagePicker.MediaTypeOptions.Images
              : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onMediaSelected(result.assets[0])
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to select image")
    } finally {
      setLoading(false)
    }
  }

  // Pick document
  const pickDocument = async () => {
    try {
      setLoading(true)
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      })

      if (result.type === "success") {
        onMediaSelected(result)
      }
    } catch (error) {
      console.error("Error picking document:", error)
      Alert.alert("Error", "Failed to select document")
    } finally {
      setLoading(false)
    }
  }

  // Show options
  const showOptions = () => {
    Alert.alert(
      "Select Media",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Select Document", onPress: pickDocument },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    )
  }

  return (
    <TouchableOpacity style={styles.button} onPress={showOptions} disabled={loading}>
      <Icon name="image" size={24} color={theme.colors.primary} />
      <Text style={styles.buttonText}>{loading ? "Loading..." : buttonText}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 8,
  },
  buttonText: {
    fontSize: hp(1.8),
    color: theme.colors.primary,
    fontWeight: "500",
  },
})

export default MediaPicker
