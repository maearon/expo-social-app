import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { useCallback } from "react"
import type { RootState, AppDispatch } from "./store"

/**
 * Typed version of useDispatch hook
 * Use this throughout your app instead of plain `useDispatch`
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()

/**
 * Typed version of useSelector hook
 * Use this throughout your app instead of plain `useSelector`
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

/**
 * Hook to access the session state
 * @returns The session state from Redux
 */
export const useSession = () => {
  return useAppSelector((state) => state.session)
}

/**
 * Hook to access the current user
 * @returns The current user from the session state
 */
export const useUser = () => {
  return useAppSelector((state) => state.session.value)
}

/**
 * Hook to check if the user is logged in
 * @returns Boolean indicating if the user is logged in
 */
export const useIsLoggedIn = () => {
  return useAppSelector((state) => state.session.loggedIn)
}

/**
 * Hook to access the session loading state
 * @returns Boolean indicating if the session is loading
 */
export const useIsSessionLoading = () => {
  return useAppSelector((state) => state.session.status === "loading")
}

/**
 * Hook to access the session error
 * @returns The session error message, if any
 */
export const useSessionError = () => {
  return useAppSelector((state) => state.session.error)
}

/**
 * Hook to create a dispatch function with error handling
 * @returns A function that dispatches an action and handles errors
 */
export const useSafeDispatch = () => {
  const dispatch = useAppDispatch()

  return useCallback(
    async (action: any) => {
      try {
        return await dispatch(action)
      } catch (error) {
        console.error("Error dispatching action:", error)
        throw error
      }
    },
    [dispatch],
  )
}

/**
 * Hook to create a dispatch function that handles loading state
 * @param setLoading Function to set loading state
 * @returns A function that dispatches an action and handles loading state
 */
export const useLoadingDispatch = (setLoading: (loading: boolean) => void) => {
  const dispatch = useAppDispatch()

  return useCallback(
    async (action: any) => {
      try {
        setLoading(true)
        const result = await dispatch(action)
        return result
      } catch (error) {
        console.error("Error dispatching action:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [dispatch, setLoading],
  )
}

/**
 * Example of how to use these hooks:
 *
 * ```tsx
 * import { useUser, useIsLoggedIn, useAppDispatch } from '../redux/hooks';
 * import { loginUser } from '../redux/session/sessionSlice';
 *
 * const MyComponent = () => {
 *   const dispatch = useAppDispatch();
 *   const user = useUser();
 *   const isLoggedIn = useIsLoggedIn();
 *
 *   const handleLogin = async () => {
 *     await dispatch(loginUser({ email, password, remember_me: true }));
 *   };
 *
 *   return (
 *     <View>
 *       {isLoggedIn ? (
 *         <Text>Welcome, {user?.name}</Text>
 *       ) : (
 *         <Button title="Login" onPress={handleLogin} />
 *       )}
 *     </View>
 *   );
 * };
 * ```
 */
