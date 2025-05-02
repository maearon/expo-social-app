import type React from "react"
import { StyleSheet } from "react-native"
import { hp } from "../helpers/common"
import { theme } from "../constants/theme"
import { Image } from "expo-image"

interface AvatarProps {
  uri?: string
  size?: number
  rounded?: number
  style?: object
}

const Avatar: React.FC<AvatarProps> = ({ uri, size = hp(4.5), rounded = theme.radius.md, style = {} }) => {
  // Default placeholder image if no URI is provided
  const defaultImage = "https://via.placeholder.com/150?text=User"

  // Process the image URI
  const getImageSource = (imageUri?: string): string => {
    if (!imageUri) return defaultImage

    // If it's already a complete URL, use it directly
    if (imageUri.startsWith("http")) {
      return imageUri
    }

    // If it's a Gravatar hash, construct the URL
    if (imageUri.length === 32 && !imageUri.includes("/")) {
      return `https://www.gravatar.com/avatar/${imageUri}?s=${Math.round(size * 2)}&d=identicon`
    }

    // For relative paths from the Rails API, construct the full URL
    // Adjust the base URL to match your Rails API
    const apiBaseUrl = "https://ruby-rails-boilerplate-3s9t.onrender.com"
    return `${apiBaseUrl}${imageUri.startsWith("/") ? "" : "/"}${imageUri}`
  }

  return (
    <Image
      source={{ uri: getImageSource(uri) }}
      transition={100}
      style={[styles.avatar, { height: size, width: size, borderRadius: rounded }, style]}
      contentFit="cover"
    />
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderCurve: "continuous",
    borderColor: theme.colors.darkLight,
    borderWidth: 1,
    backgroundColor: theme.colors.gray,
  },
})

export default Avatar
