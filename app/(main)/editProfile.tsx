"use client"

import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native"
import { useEffect, useState } from "react"
import { hp, wp } from "../../helpers/common"
import { theme } from "../../constants/theme"
import { useRouter } from "expo-router"
import ScreenWrapper from "../../components/ScreenWrapper"
import Button from "../../components/Button"
import * as ImagePicker from "expo-image-picker"
import { Image } from "expo-image"
import Header from "../../components/Header"
import Icon from "../../assets/icons"
import Input from "../../components/Input"
import { useUser, useAppDispatch } from "../../redux/hooks"
import updateUserProfile from "../../redux/session/sessionSlice"
import ApiService from "../../services"
import type { User } from "../../redux/session/sessionSlice"

// Interface for form data
interface FormData {
  name: string
  phoneNumber: string
  image: string | null
  bio: string
  address: string
}

// Interface for image picker result
interface ImagePickerResult {
  uri: string
  type?: string
  name?: string
}

const EditProfile = () => {
  const user = useUser()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phoneNumber: "",
    image: null,
    bio: "",
    address: "",
  })

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        image: user.avatar || null,
        address: user.address || "",
        bio: user.bio || "",
      })
    }
  }, [user])

  // Pick image from library
  const onPickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData({ ...formData, image: result.assets[0].uri })
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to select image")
    }
  }

  // Update user profile
  const onSubmit = async (): Promise<void> => {
    const { name, phoneNumber, address, bio } = formData

    // Validate form
    if (!name) {
      Alert.alert("Profile", "Please enter your name")
      return
    }

    setLoading(true)

    try {
      // Prepare form data
      const userData: Partial<User> = {
        name,
        phoneNumber,
        address,
        bio,
      }

      // Handle image upload if it's a new image
      if (formData.image && formData.image !== user?.avatar) {
        // Create a form data object for the image
        const imageFormData = new FormData()

        // Add the image to form data with proper typing
        const imageFile = {
          uri: formData.image,
          type: "image/jpeg",
          name: "profile-image.jpg",
        } as unknown as Blob

        imageFormData.append("avatar", imageFile)

        // Upload the image
        await ApiService.post("/users/upload-avatar", imageFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        // Add the image URL to userData
        userData.avatar = formData.image
      }

      // Update user profile
      await ApiService.put(`/users/${user?.id}`, { user: userData })

      // Update Redux state
      dispatch(updateUserProfile("UPDATE_USER_PROFILE", userData))

      Alert.alert("Success", "Profile updated successfully")
      router.back()
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <Header 
            title="Edit Profile" 
            onBackPress={() => router.back()} 
            rightComponent={null} 
          />

          {/* form */}
          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image
                source={formData.image || require("../../assets/images/avatar-placeholder.png")}
                style={styles.avatar}
                contentFit="cover"
              />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icon name="camera" strokeWidth={2.5} size={20} />
              </Pressable>
            </View>

            <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>Please fill your profile details</Text>

            <Input
              icon={<Icon name="user" size={26} />}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textLight}
              value={formData.name}
              onChangeText={(value: string) => setFormData({ ...formData, name: value })}
            />

            <Input
              icon={<Icon name="call" size={26} />}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.colors.textLight}
              value={formData.phoneNumber}
              onChangeText={(value: string) => setFormData({ ...formData, phoneNumber: value })}
              keyboardType="phone-pad"
            />

            <Input
              icon={<Icon name="map-pin" size={26} />}
              placeholder="Enter your address"
              placeholderTextColor={theme.colors.textLight}
              value={formData.address}
              onChangeText={(value: string) => setFormData({ ...formData, address: value })}
            />

            <Input
              placeholder="Enter your bio"
              placeholderTextColor={theme.colors.textLight}
              onChangeText={(value: string) => setFormData({ ...formData, bio: value })}
              multiline={true}
              value={formData.bio}
              containerStyle={styles.bio}
            />

            {/* button */}
            <Button title="Update" loading={loading} onPress={onSubmit} buttonStyle={undefined} textStyle={undefined} />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  avatarContainer: {
    height: hp(14),
    width: hp(14),
    alignSelf: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.xxl * 1.8,
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: -10,
    padding: 8,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  form: {
    gap: 18,
    marginTop: 20,
  },
  bio: {
    flexDirection: "row",
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
})

export default EditProfile
