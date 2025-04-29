import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import ApiService from "../../services"

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  status: "idle",
  error: null,
}

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.get("/notifications")
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch notifications")
    }
  },
)

export const fetchUnreadCount = createAsyncThunk("notifications/fetchUnreadCount", async (_, { rejectWithValue }) => {
  try {
    const response = await ApiService.get("/notifications/unread/count")
    return response.count
  } catch (error) {
    return rejectWithValue(error.message || "Failed to fetch unread count")
  }
})

export const markAsRead = createAsyncThunk("notifications/markAsRead", async (notificationId, { rejectWithValue }) => {
  try {
    await ApiService.put(`/notifications/${notificationId}/read`)
    return notificationId
  } catch (error) {
    return rejectWithValue(error.message || "Failed to mark notification as read")
  }
})

export const markAllAsRead = createAsyncThunk("notifications/markAllAsRead", async (_, { rejectWithValue }) => {
  try {
    await ApiService.put("/notifications/read-all")
    return true
  } catch (error) {
    return rejectWithValue(error.message || "Failed to mark all notifications as read")
  }
})

// Notifications slice
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    resetUnreadCount: (state) => {
      state.unreadCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload)
        if (notification && !notification.read) {
          notification.read = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((notification) => {
          notification.read = true
        })
        state.unreadCount = 0
      })
  },
})

// Export actions and reducer
export const { resetUnreadCount } = notificationsSlice.actions
export default notificationsSlice.reducer

// Selectors
export const selectAllNotifications = (state) => state.notifications.notifications
export const selectUnreadCount = (state) => state.notifications.unreadCount
export const selectNotificationsStatus = (state) => state.notifications.status
export const selectNotificationsError = (state) => state.notifications.error
