import API from "."

export interface CreateParams {
  followed_id: string | string[] | undefined
}

export interface CreateResponse {
  follow: boolean
}

export interface DestroyResponse {
  unfollow: boolean
}

const relationshipApi = {
  /**
   * Follow a user
   * @param params User ID to follow
   * @returns Promise with response
   */
  create(params: CreateParams): Promise<CreateResponse> {
    const url = "/relationships"
    return API.post(url, params)
  },

  /**
   * Unfollow a user
   * @param id User ID to unfollow
   * @returns Promise with response
   */
  destroy(id: string): Promise<DestroyResponse> {
    const url = `/relationships/${id}`
    return API.delete(url)
  },
}

export default relationshipApi
