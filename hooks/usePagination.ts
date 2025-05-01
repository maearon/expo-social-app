"use client"
import { logger } from "../services/debug-utils"

interface PaginationParams {
  page: number
  [key: string]: any
}

type ApiFunction<T> = (params: PaginationParams) => Promise<T>

interface UsePaginationOptions<T> {
  initialPage?: number
  pageSize?: number
  initialData?: T[]
  onSuccess?: (data: T[], meta?: any) => void
  onError?: (error: any) => void
  extractData?: (response: any) => T[]
  extractMeta?: (response: any) => any
  autoLoad?: boolean
}

/**
 * Custom hook for paginated API requests
 * @param apiFunction The API function to call
 * @param options Options for pagination
 * @returns Object with data, loading states, and pagination controls
 */
export const usePagination = <T>(apiFunction: ApiFunction<any>, options: UsePaginationOptions<T> = {}) => {
  const {
    initialPage = 1,
    initialData = [],
    onSuccess,
    onError,
    extractData = (res) => res,
    extractMeta = () => ({}),
    autoLoad = true,
  } = options

  const [data, setData] = useState<T[]>(initialData)
  const [meta, setMeta] = useState<any>({})
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const loadData = useCallback(
    async (pageNum: number, shouldAppend = false) => {
      try {
        if (shouldAppend) {
          setLoading(true)
        } else {
          setRefreshing(true)
        }
        setError(null)

        const response = await apiFunction({ page: pageNum })
        const extractedData = extractData(response)
        const metaData = extractMeta(response)

        setData((prev) => (shouldAppend ? [...prev, ...extractedData] : extractedData))
        setMeta(metaData)

        // Determine if there's more data to load
        setHasMore(extractedData.length > 0)

        if (onSuccess) {
          onSuccess(extractedData, metaData)
        }

        return { success: true, data: extractedData, meta: metaData }
      } catch (err: any) {
        logger.error("Pagination request failed:", err)
        setError(err)

        if (onError) {
          onError(err)
        }

        return { success: false, error: err }
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [apiFunction, extractData, extractMeta, onSuccess, onError],
  )

  // Load initial data
  useEffect(() => {
    if (autoLoad) {
      loadData(initialPage, false)
    }
  }, [autoLoad, initialPage, loadData])

  // Refresh data (pull to refresh)
  const refresh = useCallback(() => {
    setPage(initialPage)
    return loadData(initialPage, false)
  }, [initialPage, loadData])

  // Load next page
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      return loadData(nextPage, true)
    }
    return Promise.resolve({ success: false, error: "No more data or already loading" })
  }, [loading, hasMore, page, loadData])

  return {
    data,
    meta,
    loading,
    refreshing,
    error,
    hasMore,
    page,
    refresh,
    loadMore,
    setPage,
  }
}

export default usePagination
