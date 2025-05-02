import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import moment from "moment"
import Avatar from "./Avatar"
import { theme } from "../constants/theme"
import { hp } from "../helpers/common"
import type { Router } from "expo-router"

interface NotificationSender {
  name: string
  image?: string
  avatar?: string
}

interface NotificationData {
  postId: number
  commentId?: number
  [key: string]: any
}

interface NotificationItemProps {
  router: Router
  item: {
    id: number
    title: string
    data: NotificationData | string
    created_at: string
    sender?: NotificationSender
  }
}

const NotificationItem: React.FC<NotificationItemProps> = ({ router, item }) => {
  const createdAt = moment(item?.created_at).format("MMM D")

  const handleClick = () => {
    try {
      // Parse the data if it's a string, otherwise use it directly
      const data: NotificationData = typeof item.data === "string" ? JSON.parse(item.data) : item.data
      const { postId, commentId } = data

      router.push({
        pathname: "(main)/postDetails",
        params: { id: postId, commentId },
      })
    } catch (error) {
      console.error("Error navigating to notification:", error)
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleClick}>
      <Avatar uri={item?.sender?.image || item?.sender?.avatar} size={hp(5)} />
      <View style={styles.nameTitle}>
        <Text style={styles.text}>{item?.sender?.name}</Text>
        <Text style={[styles.text, { color: theme.colors.textDark }]}>{item?.title}</Text>
      </View>
      <Text style={[styles.text, { color: theme.colors.textLight }]}>{createdAt}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.darkLight,
    padding: 15,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
  },
  nameTitle: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
})

export default NotificationItem
