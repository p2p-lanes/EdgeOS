import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import {
  AuthService,
  type UserAuth,
  type UserPublic,
  UsersService,
  type UserVerify,
} from "@/client"
import { createErrorHandler } from "@/utils"
import useCustomToast from "./useCustomToast"

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

/**
 * Check if user has admin or higher role
 */
const isAdmin = (user: UserPublic | null | undefined): boolean => {
  return user?.role === "superadmin" || user?.role === "admin"
}

/**
 * Check if user is superadmin
 */
const isSuperadmin = (user: UserPublic | null | undefined): boolean => {
  return user?.role === "superadmin"
}

/**
 * Check if user is viewer (read-only access)
 */
const isViewer = (user: UserPublic | null | undefined): boolean => {
  return user?.role === "viewer"
}

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Get current user info
  const { data: user, isLoading: isUserLoading } = useQuery<
    UserPublic | null,
    Error
  >({
    queryKey: ["currentUser"],
    queryFn: UsersService.getCurrentUserInfo,
    enabled: isLoggedIn(),
  })

  // Step 1: Request login code (sends email with 6-digit code)
  const requestCodeMutation = useMutation({
    mutationFn: (data: UserAuth) =>
      AuthService.userLogin({ requestBody: data }),
    onSuccess: (response) => {
      showSuccessToast(`Verification code sent to ${response.email}`)
    },
    onError: createErrorHandler(showErrorToast),
  })

  // Step 2: Verify code and get token
  const verifyCodeMutation = useMutation({
    mutationFn: async (data: UserVerify) => {
      const response = await AuthService.userAuthenticate({ requestBody: data })
      localStorage.setItem("access_token", response.access_token)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      navigate({ to: "/" })
    },
    onError: createErrorHandler(showErrorToast),
  })

  const logout = () => {
    localStorage.removeItem("access_token")
    queryClient.clear()
    navigate({ to: "/login" })
  }

  return {
    user,
    isUserLoading,
    isAdmin: isAdmin(user),
    isSuperadmin: isSuperadmin(user),
    isViewer: isViewer(user),
    requestCodeMutation,
    verifyCodeMutation,
    logout,
  }
}

export { isLoggedIn, isAdmin, isSuperadmin, isViewer }
export default useAuth
