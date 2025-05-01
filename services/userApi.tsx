import API from "."
import type { Micropost } from "./micropostApi"
import type { User as UserCreate } from "../redux/session/sessionSlice"

export interface ListParams {
  page?: number
  [key: string]: any
}

export interface ListResponse<User> {
  users: User[]
  total_count: number
}

export interface User {
  readonly id: string
  name: string
  gravatar_id: string
  size: number
}

export interface CreateParams {
  user: SignUpField
}

export interface SignUpField {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface CreateResponse<UserCreate> {
  user?: UserCreate
  flash?: [message_type: string, message: string]
  status?: number
  message?: string
  errors: {
    [key: string]: string[]
  }
}

export interface UserShow {
  readonly id: string
  name: string
  gravatar_id: string
  size: number
  following: number
  followers: number
  current_user_following_user: boolean
}

export interface ShowResponse<UserShow> {
  user: UserShow
  id_relationships?: number
  microposts: Micropost[]
  total_count: number
}

export interface UserEdit {
  name: string
  email: string
}

export interface EditResponse {
  user: UserEdit
  gravatar: string
  flash?: [message_type: string, message: string]
}

export interface UpdateParams {
  user: UpdateField
}

export interface UpdateField {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface UpdateResponse {
  flash_success?: [message_type: string, message: string]
  error?: string[]
}

export interface Response {
  flash?: [message_type: string, message: string]
}

export interface UserFollow {
  readonly id: string
  name: string
  gravatar_id: string
  size: number
}

export interface FollowResponse<UserFollow, IUserFollow> {
  users: UserFollow[]
  xusers: UserFollow[]
  total_count: number
  user: IUserFollow
}

export interface IUserFollow {
  readonly id: string
  name: string
  followers: number
  following: number
  gravatar: string
  micropost: number
}

const userApi = {
  /**
   * Get list of users
   * @param params Pagination parameters
   * @returns Promise with list of users
   */
  index(params: ListParams): Promise<ListResponse<User>> {
    const url = "/users"
    return API.get(url, { params })
  },

  /**
   * Create a new user
   * @param params User data
   * @returns Promise with created user
   */
  create(params: CreateParams): Promise<CreateResponse<UserCreate>> {
    const url = "/users"
    return API.post(url, params)
  },

  /**
   * Get user details
   * @param id User ID
   * @param params Additional parameters
   * @returns Promise with user details
   */
  show(id: string, params: ListParams): Promise<ShowResponse<UserShow>> {
    const url = `/users/${id}`
    return API.get(url, { params })
  },

  /**
   * Get user edit data
   * @param id User ID
   * @returns Promise with user edit data
   */
  edit(id: string): Promise<EditResponse> {
    const url = `/users/${id}/edit`
    return API.get(url)
  },

  /**
   * Update user
   * @param id User ID
   * @param params Updated user data
   * @returns Promise with response
   */
  update(id: string, params: UpdateParams): Promise<UpdateResponse> {
    const url = `/users/${id}`
    return API.patch(url, params)
  },

  /**
   * Delete user
   * @param id User ID
   * @returns Promise with response
   */
  destroy(id: string): Promise<Response> {
    const url = `/users/${id}`
    return API.delete(url)
  },

  /**
   * Get user followers or following
   * @param id User ID
   * @param page Page number
   * @param lastUrlSegment 'following' or 'followers'
   * @returns Promise with followers/following data
   */
  follow(id: string, page: number, lastUrlSegment: string): Promise<FollowResponse<UserFollow, IUserFollow>> {
    const url = `/users/${id}/${lastUrlSegment}`
    return API.get(url, { params: { page } })
  },

  /**
   * Search for users
   * @param query Search query
   * @returns Promise with search results
   */
  search(query: string): Promise<User[]> {
    const url = "/users/search"
    return API.get(url, { params: { query } })
  },

  /**
   * Upload user avatar
   * @param avatar Avatar image file
   * @returns Promise with response
   */
  uploadAvatar(avatar: Blob): Promise<Response> {
    const url = "/users/upload-avatar"
    const formData = new FormData()
    formData.append("avatar", avatar)

    return API.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
}

export default userApi
