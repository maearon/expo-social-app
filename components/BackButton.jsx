import { Pressable, StyleSheet } from "react-native"
import { theme } from "../constants/theme"
import Icon from "../assets/icons"

const BackButton = ({ router, size = 26, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.back()
    }
  }

  return (
    <Pressable onPress={handlePress} style={styles.button}>
      <Icon name="arrowLeft" strokeWidth={2.5} size={size} color={theme.colors.text} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "rgba(0,0,0,0.07)",
  },
})

export default BackButton
