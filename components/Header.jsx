import { View, Text, StyleSheet } from "react-native"
import { memo } from "react"
import { useRouter } from "expo-router"
import { hp } from "../helpers/common"
import { theme } from "../constants/theme"
import BackButton from "./BackButton"

const Header = ({ title, showBackButton = true, mb = 10, onBackPress, rightComponent }) => {
  const router = useRouter()

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  return (
    <View style={[styles.container, { marginBottom: mb }]}>
      {showBackButton && (
        <View style={styles.backButton}>
          <BackButton router={router} onPress={handleBackPress} />
        </View>
      )}
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {title || ""}
      </Text>
      {rightComponent && <View style={styles.rightComponent}>{rightComponent}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    gap: 10,
    position: "relative",
    width: "100%",
  },
  title: {
    fontSize: hp(2.7),
    fontWeight: "600",
    color: theme.colors.textDark,
    maxWidth: "70%",
  },
  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 1,
  },
  rightComponent: {
    position: "absolute",
    right: 0,
    zIndex: 1,
  },
})

export default memo(Header)
