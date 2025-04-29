import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import ApiService from "../../services"

// Initial state
const initialState = {
  posts: [],
  status: "idle",
  error: null,
  hasMore: true,
  limit: 10,
}

// Async thunks
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async (params, { getState, rejectWithValue }) => {
  try {
    const { limit = 10, offset = 0 } = params || {}
    const response = await ApiService.get("/posts", { limit, offset })
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Failed to fetch posts")
  }
})

export const likePost = createAsyncThunk("posts/likePost", async ({ postId, userId }, { rejectWithValue }) => {
  try {
    const response = await ApiService.post(`/posts/${postId}/likes`, { userId })
    return { postId, userId, response }
  } catch (error) {
    return rejectWithValue(error.message || "Failed to like post")
  }
})

export const unlikePost = createAsyncThunk("posts/unlikePost", async ({ postId, userId }, { rejectWithValue }) => {
  try {
    await ApiService.delete(`/posts/${postId}/likes`)
    return { postId, userId }
  } catch (error) {
    return rejectWithValue(error.message || "Failed to unlike post")
  }
})

export const createPost = createAsyncThunk("posts/createPost", async (postData, { rejectWithValue }) => {
  try {
    const response = await ApiService.post("/posts", postData)
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Failed to create post")
  }
})

export const deletePost = createAsyncThunk("posts/deletePost", async (postId, { rejectWithValue }) => {
  try {
    await ApiService.delete(`/posts/${postId}`)
    return postId
  } catch (error) {
    return rejectWithValue(error.message || "Failed to delete post")
  }
})

// Posts slice
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    resetPosts: (state) => {
      state.posts = []
      state.hasMore = true
      state.limit = 10
    },
    incrementCommentCount: (state, action) => {
      const postId = action.payload
      const post = state.posts.find((p) => p.id === postId)
      if (post) {
        if (!post.comments || post.comments.length === 0) {
          post.comments = [{ count: 1 }]
        } else {
          post.comments[0].count += 1
        }
      }
    },
    decrementCommentCount: (state, action) => {
      const postId = action.payload
      const post = state.posts.find((p) => p.id === postId)
      if (post && post.comments && post.comments.length > 0 && post.comments[0].count > 0) {
        post.comments[0].count -= 1
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded"
        // If we got the same number of posts as before, there are no more posts
        if (state.posts.length === action.payload.length) {
          state.hasMore = false
        }
        state.posts = action.payload
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload
        const post = state.posts.find((p) => p.id === postId)
        if (post) {
          if (!post.postLikes) {
            post.postLikes = []
          }
          post.postLikes.push({ userId })
        }
      })

      // Unlike post
      .addCase(unlikePost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload
        const post = state.posts.find((p) => p.id === postId)
        if (post && post.postLikes) {
          post.postLikes = post.postLikes.filter((like) => like.userId !== userId)
        }
      })

      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload)
      })

      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload)
      })
  },
})

// Export actions and reducer
export const { resetPosts, incrementCommentCount, decrementCommentCount } = postsSlice.actions
export default postsSlice.reducer

// Selectors
export const selectAllPosts = (state) => state.posts.posts
export const selectPostById = (state, postId) => state.posts.posts.find((post) => post.id === postId)
export const selectPostsStatus = (state) => state.posts.status
export const selectPostsError = (state) => state.posts.error
export const selectHasMorePosts = (state) => state.posts.hasMore
