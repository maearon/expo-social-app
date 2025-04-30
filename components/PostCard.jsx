"use client"

import { View, Text, StyleSheet, Pressable } from "react-native"
import { useState } from "react"
import { theme } from "../constants/theme"
import { hp, formatTimeAgo } from "../helpers/common"
import { Image } from "expo-image"
import Icon from "../assets/icons"
import Avatar from "./Avatar"
import micropostApi from "../services/micropostApi" // Import API service directly

const PostCard = ({ item, currentUser, router, onLike }) => {
  const [post, setPost] = useState(item)
  const [isLiked, setIsLiked] = useState(post.postLikes?.some((like) => like.userId === currentUser?.id))
  const [likeCount, setLikeCount] = useState(post.postLikes?.length || 0)
  const [commentCount, setCommentCount] = useState(post.comments?.[0]?.count || 0)

  const handleLike = async () => {
    try {
      if (isLiked) {
        // Unlike post - call API directly
        await micropostApi.unlike(post.id)
        setLikeCount((prev) => prev - 1)
      } else {
        // Like post - call API directly
        await micropostApi.like(post.id)
        setLikeCount((prev) => prev + 1)
      }
      setIsLiked(!isLiked)

      // If parent provided an onLike callback, call it
      if (onLike) {
        onLike()
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const navigateToPostDetails = () => {
    router.push({
      pathname: "(main)/postDetails",
      params: { id: post.id },
    })
  }

  const navigateToProfile = () => {
    if (post.userId === currentUser.id || post.user_id === currentUser.id) {
      router.push("profile")
    } else {
      router.push({
        pathname: "(main)/userProfile",
        params: { id: post.userId || post.user_id },
      })
    }
  }

  return (
    <View style={styles.container}>
      {/* user info */}
      <Pressable style={styles.userInfo} onPress={navigateToProfile}>
        <Avatar uri={post.user?.avatar} size={hp(5)} rounded={theme.radius.sm} />
        <View>
          <Text style={styles.name}>{post.user?.name || post.user_name || "User"}</Text>
          <Text style={styles.time}>{formatTimeAgo(post.createdAt || post.created_at || post.timestamp)}</Text>
        </View>
      </Pressable>

      {/* post body */}
      <Pressable style={styles.body} onPress={navigateToPostDetails}>
        <Text style={styles.bodyText}>{post.body || post.content}</Text>
        {(post.file || post.image) && (
          <Image source={{ uri: post.file || post.image }} style={styles.image} contentFit="cover" transition={200} />
        )}
      </Pressable>

      {/* post actions */}
      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={handleLike}>
          <Icon
            name="heart"
            size={hp(2.5)}
            color={isLiked ? theme.colors.rose : theme.colors.text}
            fill={isLiked ? theme.colors.rose : "transparent"}
          />
          <Text style={styles.actionText}>{likeCount}</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={navigateToPostDetails}>
          <Icon name="message-circle" size={hp(2.5)} color={theme.colors.text} />
          <Text style={styles.actionText}>{commentCount}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  name: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  time: {
    fontSize: hp(1.6),
    color: theme.colors.gray,
  },
  body: {
    marginBottom: 14,
  },
  bodyText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    marginBottom: 14,
  },
  image: {
    width: "100%",
    height: hp(30),
    borderRadius: theme.radius.md,
  },
  actions: {
    flexDirection: "row",
    gap: 20,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
})

export default PostCard
