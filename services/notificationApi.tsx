import API from "."

export interface ListParams {
  page?: number
  limit?: number
  [key: string]: any
}

export interface Notification {
  id: number
  title: string
  content: string
  read: boolean
  created_at: string
  updated_at: string
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

export interface UnreadCountResponse {
  count: number
}

/**
 * Notification API service
 * Provides methods for managing notifications
 */
const notificationApi = {
  /**
   * Get all notifications with pagination
   * @param params Pagination parameters
   * @returns Promise with list of notifications
   */
  getAll(params: ListParams): Promise<Notification[]> {
    const url = "/notifications"
    return API.get(url, { params })
  },

  /**
   * Get unread notification count
   * @returns Promise with unread count
   */
  getUnreadCount(): Promise<UnreadCountResponse> {
    const url = "/notifications/unread/count"
    return API.get(url)
  },

  /**
   * Mark a notification as read
   * @param id Notification ID
   * @returns Promise with response
   */
  markAsRead(id: number): Promise<any> {
    const url = `/notifications/${id}/read`
    return API.put(url)
  },

  /**
   * Mark all notifications as read
   * @returns Promise with response
   */
  markAllAsRead(): Promise<any> {
    const url = "/notifications/read-all"
    return API.put(url)
  },
}

export default notificationApi
