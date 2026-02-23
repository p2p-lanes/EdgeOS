import { ApplicationsService } from "@edgeos/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import type { CreateAttendee } from "@/types/Attendee"

const handleNetworkError = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    (error as any).status === 400
  ) {
    toast.error((error as any).body?.detail ?? "Bad request")
    return
  }
  if (error instanceof TypeError && error.message.includes("fetch")) {
    toast.error("Network error. Please check your connection and try again.")
  } else if (error instanceof Error && error.name === "AbortError") {
    toast.error("Request timeout. Please try again.")
  } else {
    toast.error("Unknown error, please try again later")
  }
}

const useAttendee = () => {
  const { getRelevantApplication, updateApplication } = useApplication()
  const { getCity } = useCityProvider()
  const _queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: async (data: CreateAttendee) => {
      const city = getCity()
      const result = await ApplicationsService.addMyAttendee({
        popupId: city!.id,
        requestBody: {
          name: data.name,
          email: data.email,
          category: data.category,
          gender: data.gender,
        },
      })
      return result
    },
    onSuccess: (result) => {
      updateApplication(result)
    },
    onError: handleNetworkError,
  })

  const removeMutation = useMutation({
    mutationFn: async (attendeeId: string) => {
      const city = getCity()
      const result = await ApplicationsService.deleteMyAttendee({
        popupId: city!.id,
        attendeeId,
      })
      return result
    },
    onSuccess: (result) => {
      updateApplication(result)
    },
    onError: handleNetworkError,
  })

  const editMutation = useMutation({
    mutationFn: async ({
      attendeeId,
      data,
    }: {
      attendeeId: string
      data: CreateAttendee
    }) => {
      const city = getCity()
      const result = await ApplicationsService.updateMyAttendee({
        popupId: city!.id,
        attendeeId,
        requestBody: {
          name: data.name,
          email: data.email,
          gender: data.gender,
        },
      })
      return result
    },
    onSuccess: (result) => {
      updateApplication(result)
    },
    onError: handleNetworkError,
  })

  const addAttendee = async (data: CreateAttendee) => {
    const application = getRelevantApplication()
    const city = getCity()
    if (!application || !city) return
    return addMutation.mutateAsync(data)
  }

  const removeAttendee = async (attendeeId: string) => {
    const application = getRelevantApplication()
    const city = getCity()
    if (!application || !city) return
    return removeMutation.mutateAsync(attendeeId)
  }

  const editAttendee = async (attendeeId: string, data: CreateAttendee) => {
    const application = getRelevantApplication()
    const city = getCity()
    if (!application || !city) return
    return editMutation.mutateAsync({ attendeeId, data })
  }

  return {
    loading:
      addMutation.isPending ||
      removeMutation.isPending ||
      editMutation.isPending,
    addAttendee,
    removeAttendee,
    editAttendee,
  }
}
export default useAttendee
