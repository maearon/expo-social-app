"use client"

import type React from "react"

import { View, StyleSheet, type ViewStyle } from "react-native"
import { useRef } from "react"
import { useVideoPlayer, VideoView } from "expo-video"

interface VideoProps {
  source?: string | { uri: string }
  style?: ViewStyle
}

const Video: React.FC<VideoProps> = ({ source, style = {} }) => {
  const videoSource = source || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  const ref = useRef(null)
  const player = useVideoPlayer(typeof videoSource === "string" ? videoSource : videoSource.uri)

  return (
    <View style={[styles.container, style]}>
      {player && (
        <VideoView ref={ref} style={[styles.video, style]} player={player} allowsFullscreen allowsPictureInPicture />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    width: "100%",
    height: 275,
    borderRadius: 8,
  },
})

export default Video
