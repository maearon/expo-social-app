import type React from "react"
import { View, ActivityIndicator } from "react-native"
import { theme } from "../constants/theme"

interface LoadingProps {
  size?: "small" | "large" | number
  color?: string
}

const Loading: React.FC<LoadingProps> = ({ size = "large", color = theme.colors.primary }) => {
  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

export default Loading
