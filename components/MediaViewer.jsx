"use client"

import { View, StyleSheet, Image, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import VideoPlayer from "./VideoPlayer"
import { theme } from "../constants/theme"
import Icon from "../assets/icons"

const MediaViewer = ({ media, onRemove, style = {} }) => {
  const [mediaType, setMediaType] = useState(null)

  useEffect(() => {
    if (!media) {
      setMediaType(null)
      return
    }

    // Determine media type
    if (typeof media === "string") {
      if (media.match(/\.(jpeg|jpg|gif|png)$/i)) {
        setMediaType("image")
      } else if (media.match(/\.(mp4|mov|avi|wmv)$/i)) {
        setMediaType("video")
      } else {
        setMediaType("unknown")
      }
    } else if (media.type) {
      if (media.type.startsWith("image")) {
        setMediaType("image")
      } else if (media.type.startsWith("video")) {
        setMediaType("video")
      } else {
        setMediaType("unknown")
      }
    } else if (media.uri) {
      if (media.uri.match(/\.(jpeg|jpg|gif|png)$/i)) {
        setMediaType("image")
      } else if (media.uri.match(/\.(mp4|mov|avi|wmv)$/i)) {
        setMediaType("video")
      } else {
        setMediaType("unknown")
      }
    }
  }, [media])

  if (!media) return null

  return (
    <View style={[styles.container, style]}>
      {mediaType === "image" && (
        <Image
          source={{ uri: typeof media === "string" ? media : media.uri }}
          style={styles.media}
          resizeMode="cover"
        />
      )}

      {mediaType === "video" && <VideoPlayer source={typeof media === "string" ? media : media.uri} />}

      {onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Icon name="x-circle" size={24} color={theme.colors.rose} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: theme.colors.background,
    position: "relative",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 4,
  },
})

export default MediaViewer
