"use client"

import { HumansService } from "@edgeos/api-client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useCallback } from "react"
import { queryKeys } from "@/lib/query-keys"

const isLoggedIn = () => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("token") !== null
}

const useAuth = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const popupSlug = params.popupSlug as string | undefined

  const {
    data: user = null,
    isLoading: isUserLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.profile.current,
    queryFn: async () => HumansService.getCurrentHumanInfo(),
    enabled: isLoggedIn(),
  })

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    queryClient.clear()

    if (popupSlug) {
      router.push(`/auth?popup=${popupSlug}`)
    } else {
      router.push("/auth")
    }
  }, [queryClient, router, popupSlug])

  return {
    user,
    isUserLoading,
    isLoggedIn: !!user || isUserLoading,
    isError,
    logout,
  }
}

export { isLoggedIn }
export default useAuth
