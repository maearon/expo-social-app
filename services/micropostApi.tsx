import API from "."
import type { ErrorMessageType } from "./errorMessages"

export interface ListParams {
  page?: number
  limit?: number
  offset?: number
  [key: string]: any
}

export interface ListResponse<Micropost> {
  feed_items: Micropost[]
  followers: number
  following: number
  gravatar: string
  micropost: number
  total_count: number
}

export interface Micropost {
  readonly id: number
  content: string
  gravatar_id?: string
  image?: string
  size?: number
  timestamp: string
  created_at?: string
  updated_at?: string
  readonly user_id: string
  userId?: string // For compatibility with both API formats
  user_name?: string
  title?: string
  description?: string
  videoId?: string
  channelTitle?: string
  // Fields for compatibility with the PostCard component
  body?: string
  file?: string
  user?: {
    id: string
    name: string
    avatar?: string
  }
  postLikes?: Array<{ userId: string }>
  comments?: Array<{ count: number }>
}

export interface CreateMicropostParams {
  content: string
  image?: File | Blob
}

export interface CreateResponse {
  flash?: [message_type: string, message: string]
  error?: ErrorMessageType
}

export interface Response {
  flash?: [message_type: string, message: string]
  success?: boolean
  message?: string
}

/**
 * Micropost API service
 * Provides methods to interact with microposts
 */
const micropostApi = {
  /**
   * Get all microposts with pagination
   * @param params Pagination and filter parameters
   * @returns Promise with list of microposts and metadata
   */
  getAll(params: ListParams): Promise<ListResponse<Micropost>> {
    const url = ""
    return API.get(url, { params }).then((response) => response.data)
  },

  /**
   * Get a single micropost by ID
   * @param id Micropost ID
   * @returns Promise with micropost data
   */
  getById(id: number): Promise<Micropost> {
    const url = `/microposts/${id}`
    return API.get(url).then((response) => response.data as Micropost)
  },

  /**
   * Create a new micropost
   * @param params Micropost content and optional image
   * @returns Promise with created micropost
   */
  create(params: CreateMicropostParams): Promise<Micropost> {
    const url = "/microposts"

    // If there's an image, use FormData
    if (params.image) {
      const formData = new FormData()
      formData.append("content", params.content)
      formData.append("image", params.image)

      return API.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((response) => response.data as Micropost)
    }

    // Otherwise, just send JSON
    return API.post(url, { content: params.content }).then((response) => response.data as Micropost)
  },

  /**
   * Update an existing micropost
   * @param id Micropost ID
   * @param params Updated content and optional image
   * @returns Promise with updated micropost
   */
  update(id: number, params: Partial<CreateMicropostParams>): Promise<Micropost> {
    const url = `/microposts/${id}`

    // If there's an image, use FormData
    if (params.image) {
      const formData = new FormData()
      if (params.content) formData.append("content", params.content)
      formData.append("image", params.image)

      return API.put(url, {
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((response) => response.data as Micropost)
    }

    // Otherwise, just send JSON
    return API.put(url, params).then((response) => response.data as Micropost)
  },

  /**
   * Delete a micropost
   * @param id Micropost ID
   * @returns Promise with response
   */
  remove(id: number): Promise<Response> {
    const url = `/microposts/${id}`
    return API.delete(url).then((response) => response.data as Response)
  },

  /**
   * Like a micropost
   * @param id Micropost ID
   * @returns Promise with response
   */
  like(id: number): Promise<Response> {
    const url = `/microposts/${id}/like`
    return API.post(url, {}).then((response) => response.data as Response)
  },

  /**
   * Unlike a micropost
   * @param id Micropost ID
   * @returns Promise with response
   */
  unlike(id: number): Promise<Response> {
    const url = `/microposts/${id}/unlike`
    return API.delete(url).then((response) => response.data as Response)
  },

  /**
   * Get comments for a micropost
   * @param id Micropost ID
   * @param params Pagination parameters
   * @returns Promise with comments
   */
  getComments(id: number, params?: ListParams): Promise<any> {
    const url = `/microposts/${id}/comments`
    return API.get(url, { params })
  },

  /**
   * Add a comment to a micropost
   * @param id Micropost ID
   * @param content Comment content
   * @returns Promise with created comment
   */
  addComment(id: number, content: string): Promise<any> {
    const url = `/microposts/${id}/comments`
    return API.post(url, { content })
  },

  /**
   * Rate a YouTube video (like or dislike)
   * @param videoId YouTube video ID
   * @param rating Rating value ('like' or 'dislike')
   * @returns Promise with response
   */
  likeOrDislikeYoutubeVideo(videoId: string, rating: string): Promise<Response> {
    const url = `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=${rating}`
    return API.post(url, {}).then((response) => response.data as Response)
  },

  /**
   * Transform micropost data to match the format expected by the PostCard component
   * @param micropost Original micropost data
   * @returns Transformed micropost data
   */
  transformForPostCard(micropost: Micropost): Micropost {
    return {
      ...micropost,
      // Map fields to match PostCard expectations
      body: micropost.content,
      file: micropost.image,
      userId: micropost.user_id,
      user: {
        id: micropost.user_id,
        name: micropost.user_name || "User",
        avatar: micropost.gravatar_id ? `https://www.gravatar.com/avatar/${micropost.gravatar_id}?s=200` : undefined,
      },
      // Initialize empty arrays if not present
      postLikes: micropost.postLikes || [],
      comments: micropost.comments || [{ count: 0 }],
    }
  },
}

export default micropostApi
