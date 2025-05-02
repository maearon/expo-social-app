import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Alert, FlatList } from "react-native"
import { useRouter } from "expo-router"
import { hp, wp } from "../../helpers/common"
import { theme } from "../../constants/theme"
import Header from "../../components/Header"
import ScreenWrapper from "../../components/ScreenWrapper"
import Icon from "../../assets/icons"
import Avatar from "../../components/Avatar"
import PostCard from "../../components/PostCard"
import Loading from "../../components/Loading"
import { useUser, useAppDispatch } from "../../redux/hooks"
import { logoutUser } from "../../redux/session/sessionSlice"
import micropostApi, { type Micropost } from "../../services/micropostApi"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface Metadata {
  followers: number
  following: number
  micropost: number
  total_count: number
}

interface UserHeaderProps {
  user: ReturnType<typeof useUser>
  handleLogout: () => void
  router: ReturnType<typeof useRouter>
  metadata: Metadata | null
}

const POSTS_PER_PAGE = 5 // Fixed page size from backend

const Profile = () => {
  const router = useRouter()
  const user = useUser()
  const dispatch = useAppDispatch()

  const [microposts, setMicroposts] = useState<Micropost[]>([])
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Refs to track request state and pagination
  const isRequestInProgress = useRef<boolean>(false)
  const currentPage = useRef<number>(1)
  const totalPages = useRef<number>(1)
  const loadedPostIds = useRef<Set<number>>(new Set())

  // Calculate total pages based on total_count
  const calculateTotalPages = (totalCount: number): number => {
    return Math.ceil(totalCount / POSTS_PER_PAGE)
  }

  // Fetch microposts with optimized logic
  const fetchMicroposts = useCallback(
    async (page: number, isRefresh = false) => {
      // Prevent duplicate requests
      if (isRequestInProgress.current) return

      try {
        isRequestInProgress.current = true

        if (isRefresh) {
          setRefreshing(true)
        } else if (!refreshing) {
          setLoading(true)
        }

        // Fetch posts for the requested page
        const response = await micropostApi.getAll({ page, user_id: user?.id })

        // Transform microposts to match PostCard format
        const transformedMicroposts = response.feed_items.map((micropost) =>
          micropostApi.transformForPostCard(micropost),
        )

        // Update metadata
        setMetadata({
          followers: response.followers,
          following: response.following,
          micropost: response.micropost,
          total_count: response.total_count,
        })

        // Update total pages
        totalPages.current = calculateTotalPages(response.total_count)

        if (isRefresh) {
          // For refresh: Find new posts and add them to the beginning
          const newPosts = transformedMicroposts.filter((post) => !loadedPostIds.current.has(post.id))

          if (newPosts.length > 0) {
            // Add new posts to the beginning
            setMicroposts((prevPosts) => [...newPosts, ...prevPosts])

            // Update loaded post IDs
            newPosts.forEach((post) => loadedPostIds.current.add(post.id))

            // Recalculate current page based on total loaded posts
            currentPage.current = Math.ceil((newPosts.length + microposts.length) / POSTS_PER_PAGE)
          }
        } else {
          // For initial load or load more: Append posts that aren't already loaded
          const postsToAdd = transformedMicroposts.filter((post) => !loadedPostIds.current.has(post.id))

          if (postsToAdd.length > 0) {
            setMicroposts((prevPosts) => [...prevPosts, ...postsToAdd])

            // Update loaded post IDs
            postsToAdd.forEach((post) => loadedPostIds.current.add(post.id))

            // Update current page
            currentPage.current = page
          }
        }
      } catch (error) {
        console.error("Error fetching microposts:", error)
      } finally {
        isRequestInProgress.current = false
        setLoading(false)
        setRefreshing(false)
      }
    },
    [microposts.length, user?.id],
  )

  // Initial data loading
  useEffect(() => {
    // Reset state on component mount
    loadedPostIds.current = new Set()
    currentPage.current = 1

    fetchMicroposts(1)
  }, [fetchMicroposts])

  // Handle refresh (pull to refresh)
  const handleRefresh = useCallback(() => {
    // Only refresh if we're not already loading
    if (!isRequestInProgress.current) {
      fetchMicroposts(1, true)
    }
  }, [fetchMicroposts])

  // Load more posts when reaching the end
  const handleLoadMore = useCallback(() => {
    // Only load more if:
    // 1. We're not already loading
    // 2. We haven't reached the last page
    // 3. We're not refreshing
    if (!isRequestInProgress.current && currentPage.current < totalPages.current && !refreshing) {
      fetchMicroposts(currentPage.current + 1)
    }
  }, [fetchMicroposts, refreshing])

  // Handle post deletion
  const handleDeletePost = useCallback(
    async (post: Micropost) => {
      try {
        await micropostApi.remove(post.id)

        // Remove post from state
        setMicroposts((prevPosts) => prevPosts.filter((p) => p.id !== post.id))

        // Remove from loaded IDs
        loadedPostIds.current.delete(post.id)

        // Update metadata if available
        if (metadata) {
          setMetadata({
            ...metadata,
            micropost: metadata.micropost - 1,
            total_count: metadata.total_count - 1,
          })

          // Recalculate total pages
          totalPages.current = calculateTotalPages(metadata.total_count - 1)
        }

        Alert.alert("Success", "Post deleted successfully")
      } catch (error) {
        console.error("Error deleting post:", error)
        Alert.alert("Error", "Failed to delete post")
      }
    },
    [metadata],
  )

  // Handle logout
  const handleLogout = () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(logoutUser())
            // Clear any additional storage if needed
            await AsyncStorage.multiRemove(["token", "remember_token", "refreshToken", "accessToken"])
            router.replace("/welcome")
          } catch (error) {
            console.error("Logout error:", error)
            Alert.alert("Error", "Failed to log out. Please try again.")
          }
        },
      },
    ])
  }

  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={microposts}
        ListHeaderComponent={<UserHeader user={user} handleLogout={handleLogout} router={router} metadata={metadata} />}
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            currentUser={user}
            router={router}
            showDelete={true}
            onDelete={handleDeletePost}
            onEdit={(post) =>
              router.push({
                pathname: "newPost",
                params: { id: post.id },
              })
            }
          />
        )}
        onEndReached={handleLoadMore}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReachedThreshold={0.5}
        initialNumToRender={5} // Match backend page size
        maxToRenderPerBatch={10} // Optimize rendering
        windowSize={5} // Optimize memory usage
        removeClippedSubviews={true} // Improve performance
        ListEmptyComponent={
          loading && !refreshing ? (
            <View style={styles.centerContainer}>
              <Loading />
            </View>
          ) : microposts.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.noPosts}>No posts found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing && microposts.length > 0 ? (
            <View style={{ marginVertical: 30 }}>
              <Loading />
            </View>
          ) : !loading && currentPage.current >= totalPages.current && microposts.length > 0 ? (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
  )
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, handleLogout, router, metadata }) => {
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View>
        <Header title="Profile" mb={30} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={26} color={theme.colors.rose} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          {/* avatar */}
          <View style={styles.avatarContainer}>
            <Avatar uri={user?.avatar} size={hp(12)} rounded={theme.radius.xxl * 1.4} />
            <Pressable style={styles.editIcon} onPress={() => router.push("/editProfile")}>
              <Icon name="edit" strokeWidth={2.5} size={20} />
            </Pressable>
          </View>

          {/* username & address */}
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.infoText}>{user?.address}</Text>
          </View>

          {/* Stats */}
          {metadata && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{metadata.micropost || 0}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{metadata.followers || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{metadata.following || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          )}

          {/* email, phone */}
          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={[styles.infoText, { fontSize: hp(1.8) }]}>{user?.email}</Text>
            </View>
            {user?.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={[styles.infoText, { fontSize: hp(1.8) }]}>{user.phoneNumber}</Text>
              </View>
            )}

            {user?.bio && <Text style={[styles.infoText]}>{user.bio}</Text>}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  logoutButton: {
    position: "absolute",
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
    minHeight: "100%",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    marginHorizontal: wp(4),
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: hp(1.6),
    color: theme.colors.gray,
  },
})

export default Profile
