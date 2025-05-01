"use client"

import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native"
import { useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import useAuth from "../hooks/useAuth"
import ApiService from "../services"

const home = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Replace with your actual API endpoint for posts
      const response = await ApiService.get("/posts")
      setPosts(response)
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError("Failed to load posts. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    // Navigation will be handled by the layout component
  }

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() =>
        router.push({
          pathname: "(main)/postDetails",
          params: { id: item.id },
        })
      }
    >
      {item.image && <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />}
      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postBody} numberOfLines={2}>
          {item.body}
        </Text>
        <View style={styles.postMeta}>
          <Text style={styles.postAuthor}>By {item.author || "Unknown"}</Text>
          <Text style={styles.postDate}>{item.created_at || "Recently"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>Welcome, {user?.name || "User"}!</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading posts...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text>No posts found</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchPosts}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutButton: {
    color: "#3498db",
    fontSize: 16,
  },
  userInfo: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: "100%",
    height: 200,
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  postBody: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  postAuthor: {
    fontSize: 12,
    color: "#3498db",
  },
  postDate: {
    fontSize: 12,
    color: "#999",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
})

export default home
