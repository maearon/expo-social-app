import { useState, useCallback } from "react"
import { logger } from "../services/debug-utils"

type ApiRequestFunction<T, P> = (params: P) => Promise<T>

interface UseApiRequestOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  loadingInitial?: boolean
}

/**
 * Custom hook for making API requests with loading and error states
 * @param apiFunction The API function to call
 * @param options Options for the hook
 * @returns Object with data, loading, error, and execute function
 */
export const useApiRequest = <T, P = any>(
  apiFunction: ApiRequestFunction<T, P>,
  options: UseApiRequestOptions = {},
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(options.loadingInitial || false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (params: P) => {
      try {
        setLoading(true)
        setError(null)

        const result = await apiFunction(params)
        setData(result)

        if (options.onSuccess) {
          options.onSuccess(result)
        }

        return { success: true, data: result }
      } catch (err: any) {
        logger.error("API request failed:", err)
        setError(err)

        if (options.onError) {
          options.onError(err)
        }

        return { success: false, error: err }
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, options],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

export default useApiRequest
