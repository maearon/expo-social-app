import { View, Text, StyleSheet, Pressable, FlatList } from "react-native"
import { useEffect, useState, useCallback, useRef } from "react"
import ScreenWrapper from "../../components/ScreenWrapper"
import { useRouter } from "expo-router"
import { theme } from "../../constants/theme"
import Icon from "../../assets/icons"
import { hp, wp } from "../../helpers/common"
import PostCard from "../../components/PostCard"
import Loading from "../../components/Loading"
import Avatar from "../../components/Avatar"
import { useUser } from "../../redux/hooks"
import micropostApi, { type Micropost } from "../../services/micropostApi"

interface Metadata {
  followers: number
  following: number
  micropost: number
  total_count: number
}

const POSTS_PER_PAGE = 5 // Fixed page size from backend

const HomeScreen = () => {
  const user = useUser()
  const router = useRouter()

  // Local state for data
  const [microposts, setMicroposts] = useState<Micropost[]>([])
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [notificationCount, setNotificationCount] = useState<number>(0)

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
        const response = await micropostApi.getAll({ page })

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
    [microposts.length],
  )

  // Fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    try {
      const response = await micropostApi.getUnreadCount()
      setNotificationCount(response || 0)
    } catch (error) {
      console.error("Error fetching notification count:", error)
    }
  }, [])

  // Initial data loading
  useEffect(() => {
    // Reset state on component mount
    loadedPostIds.current = new Set()
    currentPage.current = 1

    fetchMicroposts(1)
    fetchNotificationCount()

    // Set up polling for notifications (with a longer interval to reduce server load)
    const notificationInterval = setInterval(() => {
      fetchNotificationCount()
    }, 60000) // Check every minute instead of 30 seconds

    return () => {
      clearInterval(notificationInterval)
    }
  }, [fetchMicroposts, fetchNotificationCount])

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

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Pressable>
            <Text style={styles.titlePrimary}>bookbug</Text>
          </Pressable>
          <View style={styles.icons}>
            <Pressable
              onPress={() => {
                setNotificationCount(0)
                router.push("notifications")
              }}
            >
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
              {notificationCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{notificationCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push("newPost")}>
              <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push("profile")}>
              <Avatar uri={user?.avatar} size={hp(4.3)} rounded={theme.radius.sm} style={{ borderWidth: 2 }} />
            </Pressable>
          </View>
        </View>

        {/* User stats */}
        {metadata && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metadata.micropost}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metadata.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metadata.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        )}

        {/* microposts */}
        <FlatList
          data={microposts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PostCard item={item} currentUser={user} router={router} />}
          onEndReached={handleLoadMore}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReachedThreshold={0.5}
          initialNumToRender={5} // Match backend page size
          maxToRenderPerBatch={10} // Optimize rendering
          windowSize={5} // Optimize memory usage
          removeClippedSubviews={true} // Improve performance
          ListFooterComponent={
            loading && !refreshing ? (
              <View style={{ marginVertical: microposts.length === 0 ? 200 : 30 }}>
                <Loading />
              </View>
            ) : !loading && currentPage.current >= totalPages.current && microposts.length > 0 ? (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPosts}>No more posts</Text>
              </View>
            ) : null
          }
        />
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  titlePrimary: {
    color: theme.colors.primary,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginHorizontal: wp(4),
    marginBottom: 10,
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
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },
  pillText: {
    color: "white",
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
})

export default HomeScreen
