"use client"

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useCallback, useEffect, useRef, useState } from "react"
import ScreenWrapper from "../../components/ScreenWrapper"
import { hp, wp } from "../../helpers/common"
import { theme } from "../../constants/theme"
import { Image } from "expo-image"
import RichTextEditor from "../../components/RichTextEditor"
import Button from "../../components/Button"
import * as ImagePicker from "expo-image-picker"
import { Video } from "expo-av"
import { useLocalSearchParams, useRouter } from "expo-router"
import Avatar from "../../components/Avatar"
import Icon from "../../assets/icons"
import { useUser, useAppDispatch, useAppSelector } from "../../redux/hooks"
import {
  createMicropost,
  updateMicropost,
  selectMicropostsStatus,
  fetchMicropostById,
  selectCurrentMicropost,
} from "../../redux/microposts/micropostsSlice"
import Header from "../../components/Header"

const NewPost = () => {
  const dispatch = useAppDispatch()
  const user = useUser()
  const router = useRouter()
  const params = useLocalSearchParams()
  const postId = params?.id ? Number(params.id) : null

  // Get the current micropost if we're editing
  const currentMicropost = useAppSelector(selectCurrentMicropost)
  const status = useAppSelector(selectMicropostsStatus)

  // Local state
  const [file, setFile] = useState(null)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!postId)
  const editorRef = useRef(null)

  // Fetch the micropost if we're editing
  useEffect(() => {
    if (postId) {
      dispatch(fetchMicropostById(postId))
    }
  }, [postId, dispatch])

  // Set initial content when editing
  useEffect(() => {
    if (currentMicropost && postId) {
      setContent(currentMicropost.content || currentMicropost.body || "")
      setFile(currentMicropost.file || currentMicropost.image || null)

      // Set the editor content
      setTimeout(() => {
        if (editorRef?.current) {
          editorRef.current.setContentHTML(currentMicropost.content || currentMicropost.body || "")
        }
        setInitialLoading(false)
      }, 300)
    }
  }, [currentMicropost, postId])

  // Pick an image or video from the library
  const onPick = async (isImage) => {
    try {
      const mediaConfig = {
        mediaTypes: isImage ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      }

      const result = await ImagePicker.launchImageLibraryAsync(mediaConfig)

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking media:", error)
      Alert.alert("Error", "Failed to pick media")
    }
  }

  // Handle content change from the rich text editor
  const handleContentChange = useCallback((html) => {
    setContent(html)
  }, [])

  // Submit the post
  const onSubmit = async () => {
    // Validate data
    if (!content && !file) {
      Alert.alert("Post", "Please choose an image or add post content!")
      return
    }

    setLoading(true)

    try {
      // Prepare image if selected
      let imageBlob = null
      if (file && typeof file === "string" && file.startsWith("file://")) {
        const response = await fetch(file)
        imageBlob = await response.blob()
      }

      if (postId) {
        // Update existing post
        await dispatch(
          updateMicropost({
            id: postId,
            content: content,
            image: imageBlob,
          }),
        ).unwrap()
      } else {
        // Create new post
        await dispatch(
          createMicropost({
            content: content,
            image: imageBlob,
          }),
        ).unwrap()
      }

      // Success - go back to home
      router.back()
    } catch (error) {
      console.error("Error saving post:", error)
      Alert.alert("Error", error.message || "Failed to save post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Determine if the file is a local file or a URL
  const isLocalFile = (fileUri) => {
    if (!fileUri) return false
    return typeof fileUri === "string" && fileUri.startsWith("file://")
  }

  // Get the file type (image or video)
  const getFileType = (fileUri) => {
    if (!fileUri) return null

    if (typeof fileUri === "object" && fileUri.type) {
      return fileUri.type.startsWith("image") ? "image" : "video"
    }

    if (typeof fileUri === "string") {
      const isImage = fileUri.match(/\.(jpeg|jpg|gif|png)$/i)
      const isVideo = fileUri.match(/\.(mp4|mov|avi|wmv)$/i)

      if (isImage) return "image"
      if (isVideo) return "video"

      // If no extension, try to guess from the path
      if (fileUri.includes("image") || fileUri.includes("postImages")) {
        return "image"
      } else if (fileUri.includes("video")) {
        return "video"
      }
    }

    // Default to image if we can't determine
    return "image"
  }

  if (initialLoading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.loadingContainer}>
          <Text>Loading post...</Text>
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper bg="white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <View style={styles.container}>
          <Header title={postId ? "Edit Post" : "Create Post"} mb={15} />

          <ScrollView contentContainerStyle={{ gap: 20 }}>
            {/* header */}
            <View style={styles.header}>
              <Avatar uri={user?.avatar} size={hp(6.5)} rounded={theme.radius.xl} />
              <View style={{ gap: 2 }}>
                <Text style={styles.username}>{user?.name}</Text>
                <Text style={styles.publicText}>Public</Text>
              </View>
            </View>

            {/* Rich text editor */}
            <View style={styles.textEditor}>
              <RichTextEditor editorRef={editorRef} onChange={handleContentChange} />
            </View>

            {/* Media preview */}
            {file && (
              <View style={styles.file}>
                {getFileType(file) === "video" ? (
                  <Video style={{ flex: 1 }} source={{ uri: file }} useNativeControls resizeMode="cover" isLooping />
                ) : (
                  <Image source={{ uri: file }} contentFit="cover" style={{ flex: 1 }} />
                )}

                <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                  <Icon name="x" size={25} color="rgba(255, 0, 0, 0.6)" />
                </Pressable>
              </View>
            )}

            {/* Media picker */}
            <View style={styles.media}>
              <Text style={styles.addImageText}>Add to your post</Text>
              <View style={styles.mediaIcons}>
                <TouchableOpacity onPress={() => onPick(true)}>
                  <Icon name="image" size={30} color={theme.colors.dark} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onPick(false)}>
                  <Icon name="video" size={33} color={theme.colors.dark} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Submit button */}
          <Button
            buttonStyle={{ height: hp(6.2) }}
            title={postId ? "Update" : "Post"}
            loading={loading}
            hasShadow={false}
            onPress={onSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  textEditor: {
    minHeight: hp(15),
  },
  media: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    borderCurve: "continuous",
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default NewPost
