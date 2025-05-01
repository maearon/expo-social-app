import { View, Text, StyleSheet, Pressable, FlatList, ListRenderItem } from "react-native"
import { useEffect, useState, useCallback, useMemo } from "react"
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

const HomeScreen = () => {
  const user = useUser()
  const router = useRouter()

  const [microposts, setMicroposts] = useState<Micropost[]>([])
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMicroposts = useCallback(
    async (pageNum = 1, shouldAppend = false) => {
      if (loading && !refreshing) return

      setLoading(true)
      try {
        const response = await micropostApi.getAll({ page: pageNum })
        const transformed = response.feed_items.map(micropostApi.transformForPostCard)

        setMicroposts(prev => (shouldAppend ? [...prev, ...transformed] : transformed))
        setMetadata({
          followers: response.followers,
          following: response.following,
          micropost: response.micropost,
          total_count: response.total_count,
        })

        const totalLoaded = shouldAppend ? microposts.length + transformed.length : transformed.length
        setHasMore(totalLoaded < response.total_count)

        if (shouldAppend) {
          setPage(pageNum)
        }
      } catch (err) {
        console.error("Error fetching microposts:", err)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [loading, refreshing, microposts.length],
  )

  const fetchNotificationCount = useCallback(() => {
    setNotificationCount(10) // Replace with real API call
  }, [])

  useEffect(() => {
    setPage(1)
    fetchMicroposts(1, false)
    fetchNotificationCount()

    const interval = setInterval(fetchNotificationCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMicroposts(1, false)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchMicroposts(page + 1, true)
    }
  }

  const renderItem: ListRenderItem<Micropost> = useCallback(
    ({ item }) => <PostCard item={item} currentUser={user} router={router} />,
    [user],
  )

  const keyExtractor = (item: Micropost) => String(item.id)

  const listFooter = useMemo(() => {
    if (loading && !refreshing) {
      return (
        <View style={{ marginVertical: microposts.length === 0 ? 200 : 30 }}>
          <Loading />
        </View>
      )
    }
    if (!hasMore && microposts.length > 0) {
      return (
        <View style={{ marginVertical: 30 }}>
          <Text style={styles.noPosts}>No more posts</Text>
        </View>
      )
    }
    return null
  }, [loading, refreshing, hasMore, microposts.length])

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
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

        {/* Stats */}
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

        {/* Feed */}
        <FlatList
          data={microposts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          ListFooterComponent={listFooter}
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
  icons: {
    flexDirection: "row",
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
