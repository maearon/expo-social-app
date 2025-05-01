import { View, StyleSheet, ActivityIndicator } from "react-native"
import { useState, useRef } from "react"
import { Video as ExpoVideo } from "expo-av"
import { theme } from "../constants/theme"

const VideoPlayer = ({ source, style = {}, autoplay = false }) => {
  const [status, setStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const videoRef = useRef(null)

  // Handle video load
  const handleLoad = () => {
    setLoading(false)
    if (autoplay && videoRef.current) {
      videoRef.current.playAsync()
    }
  }

  // Handle video error
  const handleError = (error) => {
    console.error("Video error:", error)
    setLoading(false)
  }

  return (
    <View style={[styles.container, style]}>
      <ExpoVideo
        ref={videoRef}
        style={styles.video}
        source={typeof source === "string" ? { uri: source } : source}
        useNativeControls
        resizeMode="contain"
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        onLoad={handleLoad}
        onError={handleError}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
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
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
})

export default VideoPlayer
