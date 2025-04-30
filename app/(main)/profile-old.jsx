"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native"
import { useRouter } from "expo-router"
import { hp, wp } from "../../helpers/common"
import { theme } from "../../constants/theme"
import Header from "../../components/Header"
import ScreenWrapper from "../../components/ScreenWrapper"
import Icon from "../../assets/icons"
import Avatar from "../../components/Avatar"
import PostCard from "../../components/PostCard"
import Loading from "../../components/Loading"
import { useAppSelector } from "../../redux/hooks"
import { selectUser } from "../../redux/session/sessionSlice"
import { logoutUser } from "../../redux/session/sessionSlice"
import micropostApi from "../../services/micropostApi"

const Profile = () => {
  const router = useRouter()
  const current_user = useAppSelector(selectUser)

  const [microposts, setMicroposts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [metadata, setMetadata] = useState(null)

  const fetchMicroposts = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      if (isLoading) return

      try {
        setIsLoading(true)
        const res = await micropostApi.getAll({ page: pageNum })

        if (isRefresh) {
          setMicroposts(res.data)
        } else {
          setMicroposts((prev) => [...prev, ...res.data])
        }

        setHasMore(res.data.length === 10)
        setMetadata(res.metadata)
      } catch (err) {
        console.error("Error loading posts:", err)
      } finally {
        setIsLoading(false)
        setRefreshing(false)
      }
    },
    [isLoading, current_user.id],
  )

  useEffect(() => {
    fetchMicroposts(page)
  }, [page])

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setPage(1)
    await fetchMicroposts(1, true)
  }

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
            await logoutUser()
            // Layout sẽ xử lý điều hướng
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
        ListHeaderComponent={<UserHeader user={current_user} handleLogout={handleLogout} router={router} metadata={metadata} />}
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard item={item} currentUser={current_user} router={router} />}
        onEndReached={handleLoadMore}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading && page === 1 ? (
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
          isLoading && microposts.length > 0 ? (
            <View style={{ marginVertical: 30 }}>
              <Loading />
            </View>
          ) : !hasMore && microposts.length > 0 ? (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
  )
}

const UserHeader = ({ current_user, handleLogout, router, metadata }) => {
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
            <Avatar uri={current_user?.avatar} size={hp(12)} rounded={theme.radius.xxl * 1.4} />
            <Pressable style={styles.editIcon} onPress={() => router.push("/editProfile")}>
              <Icon name="edit" strokeWidth={2.5} size={20} />
            </Pressable>
          </View>

          {/* username & address */}
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={styles.userName}>{current_user?.name}</Text>
            <Text style={styles.infoText}>{current_user?.address}</Text>
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
              <Text style={[styles.infoText, { fontSize: hp(1.8) }]}>{current_user?.email}</Text>
            </View>
            {current_user?.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={[styles.infoText, { fontSize: hp(1.8) }]}>{current_user.phoneNumber}</Text>
              </View>
            )}

            {current_user?.bio && <Text style={[styles.infoText]}>{current_user.bio}</Text>}
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
