import { useEffect, useState, useCallback, useMemo } from "react"
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Alert, FlatList, ListRenderItem } from "react-native"
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
  followers: number;
  following: number;
  micropost: number;
  total_count: number;
}

interface UserHeaderProps {
  user: any;
  handleLogout: () => void;
  router: ReturnType<typeof useRouter>;
  metadata: Metadata | null;
}

const Profile = () => {
  const router = useRouter()
  const user = useUser()
  const dispatch = useAppDispatch()

  const [microposts, setMicroposts] = useState<Micropost[]>([])
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [metadata, setMetadata] = useState<Metadata | null>(null)

  // Fetch microposts with pagination
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

  // Initial data loading
  useEffect(() => {
    setPage(1)
    fetchMicroposts(1, false)

    const interval = setInterval(fetchMicroposts, 30000)
    return () => clearInterval(interval)
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchMicroposts(1, false)
  }

  // Load more posts
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchMicroposts(page + 1, true)
    }
  }

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

  const renderItem: ListRenderItem<Micropost> = useCallback(
    ({ item }) => <PostCard item={item} currentUser={user} router={router} />,
    [user],
  )

  const keyExtractor = (item: Micropost) => String(item.id)

  const listFooter = useMemo(() => {
    if (loading && !refreshing && microposts.length > 0) {
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
      <FlatList
        data={microposts}
        ListHeaderComponent={<UserHeader user={user} handleLogout={handleLogout} router={router} metadata={metadata} />}
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        // keyExtractor={(item) => item.id.toString()}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}       
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.listStyle}
        ListEmptyComponent={
          loading && page === 1 ? (
            <View style={styles.centerContainer}>
              <Loading />
            </View>
          ) : microposts.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.noPosts}>No posts found</Text>
            </View>
          ) : null
        }
        // ListFooterComponent={
        //   loading && !refreshing && microposts.length > 0 ? (
        //     <View style={{ marginVertical: 30 }}>
        //       <Loading />
        //     </View>
        //   ) : !hasMore && microposts.length > 0 ? (
        //     <View style={{ marginVertical: 30 }}>
        //       <Text style={styles.noPosts}>No more posts</Text>
        //     </View>
        //   ) : null
        // }
        ListFooterComponent={listFooter}
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
          {/* {metadata && (
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
          )} */}

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
