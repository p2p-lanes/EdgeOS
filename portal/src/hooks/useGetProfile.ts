"use client"

import type { HumanProfileUpdate } from "@edgeos/api-client"
import { type HumanPublic, HumansService } from "@edgeos/api-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"

export type UpdateProfilePayload = Partial<
  Pick<
    HumanProfileUpdate,
    | "first_name"
    | "last_name"
    | "organization"
    | "telegram"
    | "gender"
    | "role"
    | "picture_url"
  >
>

interface UseGetProfileReturn {
  profile: HumanPublic | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  isUpdating: boolean
  updateError: string | null
  updateProfile: (payload: UpdateProfilePayload) => Promise<HumanPublic | null>
}

const useGetProfile = (): UseGetProfileReturn => {
  const queryClient = useQueryClient()

  const {
    data: profile = null,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.profile.current,
    queryFn: async () => {
      return HumansService.getCurrentHumanInfo()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      return HumansService.updateCurrentHuman({
        requestBody: payload as HumanProfileUpdate,
      })
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKeys.profile.current,
        (old: HumanPublic | null) => (old ? { ...old, ...updated } : updated),
      )
    },
  })

  const updateProfile = async (
    payload: UpdateProfilePayload,
  ): Promise<HumanPublic | null> => {
    try {
      return await updateMutation.mutateAsync(payload)
    } catch {
      return null
    }
  }

  return {
    profile,
    isLoading,
    error: queryError?.message ?? null,
    refresh: async () => {
      await refetch()
    },
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error?.message ?? null,
    updateProfile,
  }
}

export default useGetProfile
