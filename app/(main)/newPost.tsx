"use client"

import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TouchableOpacity } from "react-native"
import { useEffect, useRef, useState } from "react"
import ScreenWrapper from "../../components/ScreenWrapper"
import { hp, wp } from "../../helpers/common"
import { theme } from "../../constants/theme"
import { Image } from "expo-image"
import RichTextEditor from "../../components/RichTextEditor"
import Button from "../../components/Button"
import * as ImagePicker from "expo-image-picker"
import { Video, ResizeMode } from "expo-av"
import Header from "../../components/Header"
import { useLocalSearchParams, useRouter } from "expo-router"
import Avatar from "../../components/Avatar"
import Icon from "../../assets/icons"
import micropostApi from "../../services/micropostApi"
import { useUser } from "../../redux/hooks"

interface FileObject {
  uri: string;
  type?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  fileName?: string;
  duration?: number;
}

const NewPost = () => {
  const user = useUser()
  const params = useLocalSearchParams()
  const postId = params?.id ? Number(params.id) : null

  const [file, setFile] = useState<FileObject | string | null>(null)
  const bodyRef = useRef<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const editorRef = useRef<any>(null)
  const router = useRouter()

  // Fetch post data if editing
  useEffect(() => {
    const fetchPostData = async () => {
      if (postId) {
        try {
          const postData = await micropostApi.getById(postId)
          bodyRef.current = postData.content || ""
          setFile(postData.image || null)

          // Set content in editor after a short delay to ensure it's mounted
          setTimeout(() => {
            if (editorRef?.current?.setContentHTML) {
              editorRef.current.setContentHTML(postData.content || "")
            }
          }, 300)
        } catch (error) {
          console.error("Error fetching post data:", error)
          Alert.alert("Error", "Failed to load post data")
        }
      }
    }

    fetchPostData()
  }, [postId])

  // Pick image from library
  const onPick = async (isImage = true) => {
    const mediaConfig = {
      mediaTypes: isImage ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3] as [number, number],
      quality: 0.7,
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync(mediaConfig)

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        setFile({
          uri: asset.uri,
          type: asset.type,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
          fileName: asset.fileName || undefined, // Ensure fileName is not null
          duration: asset.duration ?? undefined,
        })
      }
    } catch (error) {
      console.error("Error picking media:", error)
      Alert.alert("Error", "Failed to select media")
    }
  }

  // Submit post
  const onSubmit = async () => {
    // Validate data
    if (!bodyRef.current && !file) {
      Alert.alert("Post", "Please choose an image or add post body!")
      return
    }

    setLoading(true)

    try {
      let fileBlob = null
      if (file && typeof file === "object" && file.uri) {
        fileBlob = await (await fetch(file.uri)).blob()
      }

      if (postId) {
        // Update existing post
        await micropostApi.update(postId, {
          content: bodyRef.current,
          image: fileBlob || undefined,
        })
      } else {
        // Create new post
        await micropostApi.create({
          content: bodyRef.current,
          image: fileBlob || undefined,
        })
      }

      // Reset form and navigate back
      setFile(null)
      bodyRef.current = ""
      if (editorRef.current?.setContentHTML) {
        editorRef.current.setContentHTML("")
      }
      router.back()
    } catch (error) {
      console.error("Error submitting post:", error)
      Alert.alert("Error", "Failed to submit post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Helper functions for file handling
  const isLocalFile = (fileObj: any): boolean => {
    if (!fileObj) return false
    return typeof fileObj === "object" && fileObj.uri
  }

  const getFileType = (fileObj: any): "video" | "image" | null => {
    if (!fileObj) return null
    if (isLocalFile(fileObj)) {
      return fileObj.type?.includes("video") ? "video" : "image"
    }
    return fileObj.includes(".mp4") ? "video" : "image"
  }

  const getFileUri = (fileObj: any): string | null => {
    if (!fileObj) return null
    return isLocalFile(fileObj) ? fileObj.uri : fileObj
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header 
          title={postId ? "Edit Post" : "Create Post"} 
          mb={15} 
          onBackPress={() => router.back()} 
          rightComponent={null} 
        />

        <ScrollView contentContainerStyle={{ gap: 20 }}>
          {/* header */}
          <View style={styles.header}>
            <Avatar uri={user?.avatar} size={hp(6.5)} rounded={theme.radius.xl} />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>{user?.name}</Text>
              <Text style={styles.publicText}>Public</Text>
            </View>
          </View>
            <View style={styles.textEditor}>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body: string) => (bodyRef.current = body)}
              initialValue={bodyRef.current || ""}
            />
            </View>
          {file && (
            <View style={styles.file}>
              {getFileType(file) === "video" ? (
                <Video
                  style={{ flex: 1 }}
                  source={{
                    uri: getFileUri(file) || "",
                  }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
              ) : (
                <Image source={{ uri: getFileUri(file) }} contentFit="cover" style={{ flex: 1 }} />
              )}

              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Icon name="x-circle" size={25} color="rgba(255, 0, 0, 0.6)" />
              </Pressable>
            </View>
          )}
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
        <Button
          buttonStyle={{ height: hp(6.2) }}
          textStyle={{ fontSize: hp(2), fontWeight: "600", color: theme.colors.text }}
          title={postId ? "Update" : "Post"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: "600",
    color: theme.colors.text,
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: "500",
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
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: "600",
    color: theme.colors.text,
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
})

export default NewPost
