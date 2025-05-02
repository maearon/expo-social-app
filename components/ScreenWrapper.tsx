import { View, StyleSheet, SafeAreaView, StatusBar, Platform, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type React from "react"

interface ScreenWrapperProps {
  children: React.ReactNode
  bg?: string
  style?: ViewStyle
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, bg = "#f5f5f5", style = {} }) => {
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={Platform.OS === "android"} />
      <View
        style={[
          styles.content,
          {
            paddingTop: Platform.OS === "android" ? insets.top : 0,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})

export default ScreenWrapper
