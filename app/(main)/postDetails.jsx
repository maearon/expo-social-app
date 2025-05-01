import { View, Text, StyleSheet, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform } from "react-native"
import { useState, useEffect } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import ScreenWrapper from "../../components/ScreenWrapper"
import { theme } from "../../constants/theme"
import { hp, wp, formatTimeAgo } from "../../helpers/common"
import { Image } from "expo-image"
import Icon from "../../assets/icons"
import Avatar from "../../components/Avatar"
import Loading from "../../components/Loading"
import { useUser } from "../../redux/hooks" // Only import user from Redux
import micropostApi from "../../services/micropostApi" // Import API service directly

const PostDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const user = useUser() // Get user from Redux

  // Local state
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  // Fetch post and comments
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true)
        // Fetch post details
        const postData = await micropostApi.getById(Number(id))
        const transformedPost = micropostApi.transformForPostCard(postData)
        setPost(transformedPost)
        setIsLiked(transformedPost.postLikes?.some((like) => like.userId === user?.id) || false)
        setLikeCount(transformedPost.postLikes?.length || 0)

        // Fetch comments
        const commentsData = await micropostApi.getComments(Number(id))
        setComments(commentsData || [])
      } catch (error) {
        console.error("Error fetching post details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPostDetails()
    }
  }, [id, user?.id])

  // Handle like/unlike
  const handleLike = async () => {
    try {
      if (isLiked) {
        // Unlike post
        await micropostApi.unlike(Number(id))
        setLikeCount((prev) => prev - 1)
      } else {
        // Like post
        await micropostApi.like(Number(id))
        setLikeCount((prev) => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  // Submit a new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    try {
      setCommentLoading(true)
      // Add comment via API
      const response = await micropostApi.addComment(Number(id), newComment)

      // Add new comment to the list
      setComments((prev) => [
        {
          id: response.id || Date.now(),
          content: newComment,
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          },
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])

      // Clear input
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setCommentLoading(false)
    }
  }

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      </ScreenWrapper>
    )
  }

  if (!post) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Icon name="arrow-left" size={hp(3)} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: hp(3) }} />
        </View>

        {/* Post Content */}
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <View style={styles.postContainer}>
              {/* User info */}
              <View style={styles.userInfo}>
                <Avatar uri={post.user?.avatar} size={hp(5.5)} rounded={theme.radius.sm} />
                <View>
                  <Text style={styles.userName}>{post.user?.name || "User"}</Text>
                  <Text style={styles.postTime}>
                    {formatTimeAgo(post.createdAt || post.created_at || post.timestamp)}
                  </Text>
                </View>
              </View>

              {/* Post body */}
              <View style={styles.postBody}>
                <Text style={styles.postText}>{post.body || post.content}</Text>
                {(post.file || post.image) && (
                  <Image source={{ uri: post.file || post.image }} style={styles.postImage} contentFit="cover" />
                )}
              </View>

              {/* Post actions */}
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
                <View style={styles.action}>
                  <Icon name="message-circle" size={hp(2.5)} color={theme.colors.text} />
                  <Text style={styles.actionText}>{comments.length}</Text>
                </View>
              </View>

              {/* Comments header */}
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Comments</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <Avatar uri={item.user?.avatar} size={hp(4)} rounded={theme.radius.sm} />
              <View style={styles.commentContent}>
                <Text style={styles.commentUserName}>{item.user?.name || "User"}</Text>
                <Text style={styles.commentText}>{item.content}</Text>
                <Text style={styles.commentTime}>{formatTimeAgo(item.created_at || item.timestamp)}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />

        {/* Comment input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <Pressable
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || commentLoading}
          >
            {commentLoading ? <Loading size="small" color="#fff" /> : <Icon name="send" size={hp(2)} color="#fff" />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: hp(2),
    color: theme.colors.text,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: theme.colors.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  postContainer: {
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  userName: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: theme.colors.text,
    marginLeft: 10,
  },
  postTime: {
    fontSize: hp(1.6),
    color: theme.colors.gray,
    marginLeft: 10,
  },
  postBody: {
    marginBottom: 15,
  },
  postText: {
    fontSize: hp(2),
    color: theme.colors.text,
    marginBottom: 15,
    lineHeight: hp(2.8),
  },
  postImage: {
    width: "100%",
    height: hp(30),
    borderRadius: theme.radius.md,
  },
  actions: {
    flexDirection: "row",
    marginBottom: 20,
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
  commentsHeader: {
    marginTop: 10,
    marginBottom: 15,
  },
  commentsTitle: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: theme.colors.text,
  },
  commentItem: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentUserName: {
    fontSize: hp(1.8),
    fontWeight: "bold",
    color: theme.colors.text,
  },
  commentText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    marginTop: 5,
  },
  commentTime: {
    fontSize: hp(1.4),
    color: theme.colors.gray,
    marginTop: 5,
  },
  noCommentsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noCommentsText: {
    fontSize: hp(1.8),
    color: theme.colors.gray,
    textAlign: "center",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: hp(1.8),
    maxHeight: hp(10),
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: hp(4.5),
    height: hp(4.5),
    borderRadius: hp(2.25),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.gray,
  },
})

export default PostDetailsScreen
