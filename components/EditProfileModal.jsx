import { View, Text, Modal, Pressable, StyleSheet, Image } from "react-native"
import { useState } from "react"
import { hp, wp } from "../helpers/common"
import { theme } from "../constants/theme"
import { useUser } from "../redux/hooks"
import Icon from "../assets/icons"
import Button from "./Button"
import Input from "./Input"
import * as ImagePicker from "expo-image-picker"
import ApiService from "../services"
import { useAppDispatch } from "../redux/hooks"
import { updateUserProfile } from "../redux/session/sessionSlice"

const EditProfileModal = ({ open, toggle }) => {
  const user = useUser()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    image: user?.avatar || null,
  })

  // Pick image from library
  const pickImage = async () => {
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
    }
  }

  // Save profile changes
  const saveChanges = async () => {
    if (!formData.name.trim()) {
      alert("Please enter your name")
      return
    }

    setLoading(true)

    try {
      // Prepare form data
      const userData = {
        name: formData.name,
        bio: formData.bio,
      }

      // Handle image upload if it's a new image
      if (formData.image && formData.image !== user?.avatar) {
        // Create a form data object for the image
        const imageFormData = new FormData()
        imageFormData.append("avatar", {
          uri: formData.image,
          type: "image/jpeg",
          name: "profile-image.jpg",
        })

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
      dispatch(updateUserProfile(userData))

      // Close modal
      toggle(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={open} onRequestClose={() => toggle(false)}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <Pressable style={styles.closeButton} onPress={() => toggle(false)}>
              <Icon name="x" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={styles.avatar}>
              <Image
                source={formData.image ? { uri: formData.image } : require("../assets/images/avatar-placeholder.png")}
                style={{ width: "100%", height: "100%", borderRadius: 100 }}
              />
              <Pressable style={styles.editIcon} onPress={pickImage}>
                <Icon name="camera" size={20} color={theme.colors.textLight} />
              </Pressable>
            </View>

            <Input
              placeholder="Your name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              icon={<Icon name="user" size={24} color={theme.colors.textLight} />}
            />

            <Input
              placeholder="Your bio"
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              numberOfLines={4}
              containerStyle={styles.bioInput}
              icon={<Icon name="info" size={24} color={theme.colors.textLight} />}
            />

            <Button title="Save Changes" loading={loading} onPress={saveChanges} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    height: hp(75),
    width: wp(90),
    backgroundColor: "white",
    borderRadius: 30,
    borderCurve: "continuous",
    padding: wp(4),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: theme.colors.text,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 5,
  },
  form: {
    flex: 1,
    gap: 20,
  },
  avatar: {
    height: hp(15),
    width: hp(15),
    alignSelf: "center",
    marginBottom: 10,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 10,
    borderRadius: 50,
    backgroundColor: theme.colors.darkLight,
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
  },
  bioInput: {
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
})

export default EditProfileModal
