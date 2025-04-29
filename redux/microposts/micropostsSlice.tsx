import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import micropostApi, { type Micropost, type ListParams } from "../../services/micropostApi"
import type { RootState } from "../store"

// Define the state interface
interface MicropostsState {
  microposts: Micropost[]
  currentMicropost: Micropost | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  hasMore: boolean
  metadata: {
    followers: number
    following: number
    micropost: number
    total_count: number
  } | null
}

// Initial state
const initialState: MicropostsState = {
  microposts: [],
  currentMicropost: null,
  status: "idle",
  error: null,
  hasMore: true,
  metadata: null,
}

// Async thunks
export const fetchMicroposts = createAsyncThunk(
  "microposts/fetchMicroposts",
  async (params: ListParams, { rejectWithValue }) => {
    try {
      const response = await micropostApi.getAll(params)

      // Transform microposts to match the format expected by PostCard
      const transformedMicroposts = response.feed_items.map((micropost) => micropostApi.transformForPostCard(micropost))

      return {
        microposts: transformedMicroposts,
        metadata: {
          followers: response.followers,
          following: response.following,
          micropost: response.micropost,
          total_count: response.total_count,
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch microposts")
    }
  },
)

export const fetchMicropostById = createAsyncThunk(
  "microposts/fetchMicropostById",
  async (id: number, { rejectWithValue }) => {
    try {
      const micropost = await micropostApi.getById(id)
      return micropostApi.transformForPostCard(micropost)
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch micropost")
    }
  },
)

export const createMicropost = createAsyncThunk(
  "microposts/createMicropost",
  async ({ content, image }: { content: string; image?: File | Blob }, { rejectWithValue }) => {
    try {
      const micropost = await micropostApi.create({ content, image })
      return micropostApi.transformForPostCard(micropost)
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create micropost")
    }
  },
)

export const updateMicropost = createAsyncThunk(
  "microposts/updateMicropost",
  async ({ id, content, image }: { id: number; content?: string; image?: File | Blob }, { rejectWithValue }) => {
    try {
      const micropost = await micropostApi.update(id, { content, image })
      return micropostApi.transformForPostCard(micropost)
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update micropost")
    }
  },
)

export const deleteMicropost = createAsyncThunk(
  "microposts/deleteMicropost",
  async (id: number, { rejectWithValue }) => {
    try {
      await micropostApi.remove(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete micropost")
    }
  },
)

export const likeMicropost = createAsyncThunk(
  "microposts/likeMicropost",
  async ({ id, userId }: { id: number; userId: string }, { rejectWithValue }) => {
    try {
      await micropostApi.like(id)
      return { id, userId }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to like micropost")
    }
  },
)

export const unlikeMicropost = createAsyncThunk(
  "microposts/unlikeMicropost",
  async ({ id, userId }: { id: number; userId: string }, { rejectWithValue }) => {
    try {
      await micropostApi.unlike(id)
      return { id, userId }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to unlike micropost")
    }
  },
)

// Create the slice
const micropostsSlice = createSlice({
  name: "microposts",
  initialState,
  reducers: {
    resetMicroposts: (state) => {
      state.microposts = []
      state.hasMore = true
      state.status = "idle"
      state.error = null
    },
    clearCurrentMicropost: (state) => {
      state.currentMicropost = null
    },
    incrementCommentCount: (state, action: PayloadAction<number>) => {
      const micropostId = action.payload
      const micropost = state.microposts.find((m) => m.id === micropostId)
      if (micropost) {
        if (!micropost.comments || micropost.comments.length === 0) {
          micropost.comments = [{ count: 1 }]
        } else {
          micropost.comments[0].count += 1
        }
      }

      if (state.currentMicropost && state.currentMicropost.id === micropostId) {
        if (!state.currentMicropost.comments || state.currentMicropost.comments.length === 0) {
          state.currentMicropost.comments = [{ count: 1 }]
        } else {
          state.currentMicropost.comments[0].count += 1
        }
      }
    },
    decrementCommentCount: (state, action: PayloadAction<number>) => {
      const micropostId = action.payload
      const micropost = state.microposts.find((m) => m.id === micropostId)
      if (micropost && micropost.comments && micropost.comments.length > 0 && micropost.comments[0].count > 0) {
        micropost.comments[0].count -= 1
      }

      if (
        state.currentMicropost &&
        state.currentMicropost.id === micropostId &&
        state.currentMicropost.comments &&
        state.currentMicropost.comments.length > 0 &&
        state.currentMicropost.comments[0].count > 0
      ) {
        state.currentMicropost.comments[0].count -= 1
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch microposts
      .addCase(fetchMicroposts.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchMicroposts.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.microposts = action.payload.microposts
        state.metadata = action.payload.metadata
        state.hasMore = action.payload.microposts.length < (state.metadata?.total_count || 0)
        state.error = null
      })
      .addCase(fetchMicroposts.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })

      // Fetch micropost by ID
      .addCase(fetchMicropostById.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchMicropostById.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.currentMicropost = action.payload
        state.error = null
      })
      .addCase(fetchMicropostById.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })

      // Create micropost
      .addCase(createMicropost.fulfilled, (state, action) => {
        state.microposts.unshift(action.payload)
        if (state.metadata) {
          state.metadata.micropost += 1
          state.metadata.total_count += 1
        }
      })

      // Update micropost
      .addCase(updateMicropost.fulfilled, (state, action) => {
        const index = state.microposts.findIndex((m) => m.id === action.payload.id)
        if (index !== -1) {
          state.microposts[index] = action.payload
        }
        if (state.currentMicropost && state.currentMicropost.id === action.payload.id) {
          state.currentMicropost = action.payload
        }
      })

      // Delete micropost
      .addCase(deleteMicropost.fulfilled, (state, action) => {
        state.microposts = state.microposts.filter((m) => m.id !== action.payload)
        if (state.currentMicropost && state.currentMicropost.id === action.payload) {
          state.currentMicropost = null
        }
        if (state.metadata) {
          state.metadata.micropost = Math.max(0, state.metadata.micropost - 1)
          state.metadata.total_count = Math.max(0, state.metadata.total_count - 1)
        }
      })

      // Like micropost
      .addCase(likeMicropost.fulfilled, (state, action) => {
        const { id, userId } = action.payload
        const micropost = state.microposts.find((m) => m.id === id)
        if (micropost) {
          if (!micropost.postLikes) {
            micropost.postLikes = []
          }
          micropost.postLikes.push({ userId })
        }

        if (state.currentMicropost && state.currentMicropost.id === id) {
          if (!state.currentMicropost.postLikes) {
            state.currentMicropost.postLikes = []
          }
          state.currentMicropost.postLikes.push({ userId })
        }
      })

      // Unlike micropost
      .addCase(unlikeMicropost.fulfilled, (state, action) => {
        const { id, userId } = action.payload
        const micropost = state.microposts.find((m) => m.id === id)
        if (micropost && micropost.postLikes) {
          micropost.postLikes = micropost.postLikes.filter((like) => like.userId !== userId)
        }

        if (state.currentMicropost && state.currentMicropost.id === id && state.currentMicropost.postLikes) {
          state.currentMicropost.postLikes = state.currentMicropost.postLikes.filter((like) => like.userId !== userId)
        }
      })
  },
})

// Export actions and reducer
export const { resetMicroposts, clearCurrentMicropost, incrementCommentCount, decrementCommentCount } =
  micropostsSlice.actions

export default micropostsSlice.reducer

// Selectors
export const selectAllMicroposts = (state: RootState) => state.microposts.microposts
export const selectMicropostById = (state: RootState, micropostId: number) =>
  state.microposts.microposts.find((m) => m.id === micropostId)
export const selectCurrentMicropost = (state: RootState) => state.microposts.currentMicropost
export const selectMicropostsStatus = (state: RootState) => state.microposts.status
export const selectMicropostsError = (state: RootState) => state.microposts.error
export const selectHasMoreMicroposts = (state: RootState) => state.microposts.hasMore
export const selectMicropostsMetadata = (state: RootState) => state.microposts.metadata
