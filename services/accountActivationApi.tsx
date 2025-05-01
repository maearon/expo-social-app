import API from "."
import type { User } from "../redux/session/sessionSlice"

export interface UpdateResponse {
  user_id?: string
  flash?: [message_type: string, message: string]
  error?: string[]
}

export interface UpdateParams {
  resend_activation_email: ResendActivationEmailField
}

export interface ResendActivationEmailField {
  email: string
}

export interface Response<User> {
  user?: User
  jwt?: string
  token?: string
  flash: [message_type: string, message: string]
}

const accountActivationApi = {
  /**
   * Request account activation email
   * @param params Email to send activation to
   * @returns Promise with response
   */
  create(params: UpdateParams): Promise<UpdateResponse> {
    const url = `/account_activations`
    return API.post(url, params)
  },

  /**
   * Activate account with token
   * @param activation_token Activation token
   * @param email User email
   * @returns Promise with response
   */
  update(activation_token: string, email: string): Promise<Response<User>> {
    const url = `/account_activations/${activation_token}`
    return API.patch(url, { email: email })
  },
}

export default accountActivationApi
