"use client"

import { View, Text, StyleSheet, Pressable, FlatList } from "react-native"
import { useEffect, useState } from "react"
import ScreenWrapper from "../../components/ScreenWrapper"
import { useRouter } from "expo-router"
import { theme } from "../../constants/theme"
import Icon from "../../assets/icons"
import { hp, wp } from "../../helpers/common"
import PostCard from "../../components/PostCard"
import Loading from "../../components/Loading"
import Avatar from "../../components/Avatar"
import { useUser } from "../../redux/hooks"
import ApiService from "../../services"

var limit = 0
const HomeScreen = () => {
  const user = useUser()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Initial fetch of posts and notifications
  useEffect(() => {
    getPosts()
    getNotificationCount()

    // Set up polling for new notifications (as an alternative to Supabase real-time)
    const notificationInterval = setInterval(() => {
      getNotificationCount()
    }, 30000) // Check every 30 seconds

    return () => {
      clearInterval(notificationInterval)
    }
  }, [])

  // Get notification count
  const getNotificationCount = async () => {
    try {
      const response = await ApiService.get("/notifications/unread/count")
      if (response && response.count !== undefined) {
        setNotificationCount(response.count)
      }
    } catch (error) {
      console.error("Error fetching notification count:", error)
    }
  }

  // Fetch posts with pagination
  const getPosts = async () => {
    if (!hasMore || loading) return null

    try {
      setLoading(true)
      limit = limit + 10 // get 10 more posts everytime
      console.log("fetching posts: ", limit)

      const response = await ApiService.get("/posts", { limit, offset: 0 })

      if (response) {
        // If we got the same number of posts as before, there are no more posts
        if (posts.length === response.length) {
          setHasMore(false)
        }
        setPosts(response)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle post updates (for real-time-like functionality)
  const refreshPosts = async () => {
    limit = 10 // Reset to initial limit
    setHasMore(true)
    await getPosts()
  }

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

        {/* posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item, index) => item.id.toString()}
          renderItem={({ item }) => <PostCard item={item} currentUser={user} router={router} />}
          onEndReached={() => {
            getPosts()
            console.log("got to the end")
          }}
          onRefresh={refreshPosts}
          refreshing={loading && posts.length > 0}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore ? (
              <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPosts}>No more posts</Text>
              </View>
            )
          }
        />
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: wp(4)
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
