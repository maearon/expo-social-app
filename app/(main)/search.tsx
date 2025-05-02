import { View, Text, StyleSheet, TextInput, FlatList, Pressable } from "react-native"
import { useState, useCallback } from "react"
import ScreenWrapper from "../../components/ScreenWrapper"
import Header from "../../components/Header"
import { hp, wp } from "../../helpers/common"
import { theme } from "../../constants/theme"
import Icon from "../../assets/icons"
import Avatar from "../../components/Avatar"
import Loading from "../../components/Loading"
import { useRouter } from "expo-router"
import { useUser } from "../../redux/hooks"
import ApiService from "../../services"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

const Search = () => {
  const [query, setQuery] = useState<string>("")
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [searched, setSearched] = useState<boolean>(false)

  const router = useRouter()
  const user = useUser()

  // Search users
  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setSearched(false)
      return
    }

    try {
      setLoading(true)
      const response = await ApiService.get("/users/search", { params: { query: searchQuery } })

      if (response) {
        setResults(response)
      } else {
        setResults([])
      }
      setSearched(true)
    } catch (error) {
      console.error("Error searching users:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle search input
  const handleSearch = (text: string) => {
    setQuery(text)
    if (text.length >= 2) {
      searchUsers(text)
    } else {
      setResults([])
      setSearched(false)
    }
  }

  // Navigate to user profile
  const navigateToProfile = (userId: string) => {
    if (userId === user?.id) {
      router.push("/profile")
    } else {
      router.push({
        pathname: "(main)/userProfile",
        params: { id: userId },
      })
    }
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Search" />

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={theme.colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={theme.colors.textLight}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleSearch("")}>
              <Icon name="x" size={20} color={theme.colors.textLight} />
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <Loading />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable style={styles.userItem} onPress={() => navigateToProfile(item.id)}>
                <Avatar uri={item.avatar} size={hp(6)} rounded={theme.radius.full} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              searched && !loading ? (
                <View style={styles.centerContainer}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 15,
    marginVertical: 15,
    height: hp(6),
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.8),
    marginLeft: 10,
    color: theme.colors.text,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginTop: 50,
  },
  listContainer: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: hp(1.8),
    fontWeight: "600",
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginTop: 2,
  },
})

export default Search
