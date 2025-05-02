"use client"

import { View, Text, StyleSheet, FlatList } from "react-native"
import { useEffect, useState, useCallback } from "react"
import ScreenWrapper from "../../components/ScreenWrapper"
import Header from "../../components/Header"
import { hp, wp } from "../../helpers/common"
import { theme } from "../../constants/theme"
import { useRouter } from "expo-router"
import { useUser } from "../../redux/hooks"
import NotificationItem from "../../components/NotificationItem"
import ApiService from "../../services"
import Loading from "../../components/Loading"

interface Notification {
  id: number
  title: string
  content: string
  read: boolean
  created_at: string
  sender?: {
    id: string
    name: string
    image?: string
    avatar?: string
  }
  data:
    | string
    | {
        postId: number
        commentId?: number
        [key: string]: any
      }
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)

  const user = useUser()
  const router = useRouter()

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(
    async (pageNum = 1, shouldAppend = false) => {
      if (loading && !refreshing) return

      try {
        setLoading(true)
        // Call the API to get notifications
        const response = await ApiService.get("/notifications", { params: { page: pageNum } })

        if (response) {
          if (shouldAppend) {
            setNotifications((prev) => [...prev, ...response])
          } else {
            setNotifications(response)
          }

          // Check if there are more notifications to load
          setHasMore(response.length > 0)

          // Only update page when appending
          if (shouldAppend) {
            setPage(pageNum)
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [loading, refreshing],
  )

  // Initial data loading
  useEffect(() => {
    fetchNotifications(1, false)

    // Mark notifications as read
    const markAsRead = async () => {
      try {
        await ApiService.put("/notifications/read-all")
      } catch (error) {
        console.error("Error marking notifications as read:", error)
      }
    }

    markAsRead()
  }, [fetchNotifications])

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchNotifications(1, false)
  }

  // Load more notifications
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, true)
    }
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Notifications" />

        <FlatList
          data={notifications}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NotificationItem key={item.id} item={item} router={router} />}
          onEndReached={handleLoadMore}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            loading ? (
              <View style={styles.centerContainer}>
                <Loading />
              </View>
            ) : (
              <Text style={styles.noData}>No notifications yet</Text>
            )
          }
          ListFooterComponent={
            loading && !refreshing && notifications.length > 0 ? (
              <View style={{ marginVertical: 20 }}>
                <Loading />
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
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10,
    minHeight: "100%",
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: "center",
    marginTop: 50,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
})

export default Notifications
