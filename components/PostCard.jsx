import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { useState, useEffect } from "react"
import { theme } from "../constants/theme"
import { Image } from "expo-image"
import { hp } from "../helpers/common"
import moment from "moment"
import RenderHtml from "react-native-render-html"
import Icon from "../assets/icons"
import { Share } from "react-native"
import Loading from "./Loading"
import Avatar from "./Avatar"
import ApiService from "../services"

const textStyle = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
}

const tagsStyles = {
  div: textStyle,
  p: textStyle,
  ol: textStyle,
  h1: {
    color: theme.colors.dark,
  },
  h4: {
    color: theme.colors.dark,
  },
}

const PostCard = ({
  item,
  currentUser,
  router,
  showMoreIcon = true,
  hasShadow = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
}) => {
  const [likes, setLikes] = useState([])
  const [loading, setLoading] = useState(false)

  const liked = likes.filter((like) => like.userId === currentUser?.id)[0] ? true : false
  const createdAt = moment(item?.created_at || item?.timestamp).format("MMM D")
  const htmlBody = { html: item?.body || item?.content }
  const shadowStyles = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  }

  useEffect(() => {
    setLikes(item?.postLikes || [])
  }, [item?.postLikes])

  const onLike = async () => {
    try {
      if (liked) {
        // Unlike post
        const updatedLikes = likes.filter((like) => like.userId !== currentUser?.id)
        setLikes([...updatedLikes])

        await ApiService.delete(`/microposts/${item?.id}/unlike`)
      } else {
        // Like post
        const data = {
          userId: currentUser?.id,
          postId: item?.id,
        }

        setLikes([...likes, data])
        await ApiService.post(`/microposts/${item?.id}/like`, {})
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      Alert.alert("Post", "Something went wrong!")
    }
  }

  const onShare = async () => {
    try {
      const content = { message: item?.body || item?.content }
      if (item?.file || item?.image) {
        setLoading(true)
        // For simplicity, we're just sharing the text content
        content.message = `Check out this post: ${item?.body || item?.content}`
        setLoading(false)
      }
      await Share.share(content)
    } catch (error) {
      console.error("Error sharing post:", error)
      Alert.alert("Share", "Failed to share post")
    }
  }

  const handlePostDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel delete"),
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => onDelete(item),
        style: "destructive",
      },
    ])
  }

  const openPostDetails = () => {
    router.push({
      pathname: "(main)/postDetails",
      params: { id: item?.id },
    })
  }

  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        {/* user info and post time */}
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.avatar || item?.user?.image || item?.gravatar_id}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name || item?.user_name || "User"}</Text>
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </View>

        {/* actions */}
        {showMoreIcon && (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="threeDotsHorizontal" size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        {showDelete && currentUser.id === (item.userId || item.user_id) && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Icon name="delete" size={hp(2.5)} color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* post image & body */}
      <View style={styles.content}>
        <View style={styles.postBody}>
          {(item?.body || item?.content) && (
            <RenderHtml contentWidth={hp(100)} source={htmlBody} tagsStyles={tagsStyles} />
          )}
        </View>

        {/* post image */}
        {(item?.file || item?.image) && (
          <Image
            source={{ uri: item?.file || item?.image }}
            transition={100}
            style={styles.postMedia}
            contentFit="cover"
          />
        )}
      </View>

      {/* like & comment */}
      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Icon
              name="heart"
              fill={liked ? theme.colors.rose : "transparent"}
              size={24}
              color={liked ? theme.colors.rose : theme.colors.textLight}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes?.length || 0}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="comment" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>{item?.comments?.[0]?.count || 0}</Text>
        </View>
        <View style={styles.footerButton}>
          {loading ? (
            <Loading size="small" />
          ) : (
            <TouchableOpacity onPress={onShare}>
              <Icon name="share" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: "continuous",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
  },
  postMedia: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
})

export default PostCard
