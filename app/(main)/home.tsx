"use client"

import { View, Text, StyleSheet, Pressable, FlatList, ListRenderItem } from "react-native"
import { useEffect, useState, useCallback } from "react"
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
  followers: number;
  following: number;
  micropost: number;
  total_count: number;
}

const HomeScreen = () => {
  const user = useUser()
  const router = useRouter()

  // Local state for data that was previously in Redux
  const [microposts, setMicroposts] = useState<Micropost[]>([])
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [notificationCount, setNotificationCount] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Fetch microposts directly from API
  const fetchMicroposts = useCallback(
    async (pageNum = 1, shouldAppend = false) => {
      if (loading && !refreshing) return

      try {
        setLoading(true)
        // Only pass page parameter - Rails API has fixed perpage of 5
        const response = await micropostApi.getAll({ page: pageNum })

        // Transform microposts to match PostCard format
        const transformedMicroposts = response.feed_items.map((micropost) =>
          micropostApi.transformForPostCard(micropost),
        )

        // Update state with API response
        if (shouldAppend) {
          setMicroposts((prev) => [...prev, ...transformedMicroposts])
        } else {
          // When not appending (refreshing), we still want to start from page 1
          setMicroposts(transformedMicroposts)
        }

        setMetadata({
          followers: response.followers,
          following: response.following,
          micropost: response.micropost,
          total_count: response.total_count,
        })

        // Check if there are more posts to load
        setHasMore(
          transformedMicroposts.length > 0 &&
            (shouldAppend ? microposts.length + transformedMicroposts.length : transformedMicroposts.length) <
              response.total_count,
        )

        // Only update the page number when we're appending
        if (shouldAppend) {
          setPage(pageNum)
        }
      } catch (error) {
        console.error("Error fetching microposts:", error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [loading, refreshing, microposts.length],
  )

  // Fetch notification count directly from API
  const fetchNotificationCount = useCallback(async () => {
    // For now, just set a static notification count
    // You can replace this with an actual API call when ready
    setNotificationCount(10)
  }, [])

  // Initial data loading
  useEffect(() => {
    // Start with page 1
    setPage(1)
    fetchMicroposts(1, false)
    fetchNotificationCount()

    // Set up polling for notifications
    const notificationInterval = setInterval(() => {
      fetchNotificationCount()
    }, 30000) // Check every 30 seconds

    return () => {
      clearInterval(notificationInterval)
    }
  }, [fetchMicroposts, fetchNotificationCount])

  // Handle refresh (pull to refresh)
  const handleRefresh = () => {
    setRefreshing(true)
    // When refreshing, we want to load the first page but keep our current page number
    fetchMicroposts(1, false)
  }

  // Load more posts when reaching the end
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      // Load the next page and append to existing posts
      fetchMicroposts(page + 1, true)
    }
  }

  const renderItem: ListRenderItem<Micropost> = ({ item }) => (
    <PostCard item={item} currentUser={user} router={router} />
  )

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Pressable>
            <Text style={styles.title}>LinkUp</Text>
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
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && !refreshing ? (
              <View style={{ marginVertical: microposts.length === 0 ? 200 : 30 }}>
                <Loading />
              </View>
            ) : !hasMore && microposts.length > 0 ? (
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
