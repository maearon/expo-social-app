import API from "."

export interface CreateParams {
  password_reset: PasswordResetCreateField
}

export interface PasswordResetCreateField {
  email: string
}

export interface CreateResponse {
  flash: [message_type: string, message: string]
}

export interface UpdateResponse {
  user_id?: string
  flash?: [message_type: string, message: string]
  error?: string[]
}

export interface UpdateParams {
  email: string
  user: PasswordResetUpdateField
}

export interface PasswordResetUpdateField {
  password: string
  password_confirmation: string
}

const passwordResetApi = {
  /**
   * Request password reset
   * @param params Email to send reset link to
   * @returns Promise with response
   */
  create(params: CreateParams): Promise<CreateResponse> {
    const url = "/password_resets"
    return API.post(url, params)
  },

  /**
   * Reset password with token
   * @param reset_token Reset token
   * @param params New password data
   * @returns Promise with response
   */
  update(reset_token: string, params: UpdateParams): Promise<UpdateResponse> {
    const url = `/password_resets/${reset_token}`
    return API.put(url, params)
  },
}

export default passwordResetApi
