"use client"

import {
  ApiError,
  ApplicationsService,
  GroupsService,
} from "@edgeos/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useSearchParams } from "next/navigation"
import { useState } from "react"
import { queryKeys } from "@/lib/query-keys"
import type { CheckoutState, FormDataProps } from "../types"
import useCookies from "./useCookies"

const useCheckoutState = () => {
  const searchParams = useSearchParams()
  const groupParam = searchParams.get("group")
  const { group } = useParams()
  const queryClient = useQueryClient()
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("form")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { setCookie } = useCookies()

  const submitMutation = useMutation({
    mutationFn: async ({
      formData,
      groupData,
    }: {
      formData: FormDataProps
      groupData: any
    }) => {
      const groupId = (groupParam || group) as string
      if (!groupId) throw new Error("Invalid group ID")

      setCookie(
        JSON.stringify({
          ...formData,
          local_resident: formData.local_resident === "yes",
          group_id: groupData.id,
          popup_id: groupData.popup_id,
        }),
      )

      await GroupsService.addGroupMember({
        groupId,
        requestBody: {
          ...formData,
          local_resident: formData.local_resident === "yes",
        },
      })

      const apps = await ApplicationsService.listMyApplications()
      const matchingApp = apps.results.find(
        (app) =>
          app.popup_id === groupData.popup_id || app.group_id === groupId,
      )

      return { matchingApp, groupId, groupData }
    },
    onMutate: () => {
      setCheckoutState("processing")
      setErrorMessage(null)
    },
    onSuccess: ({ matchingApp }) => {
      if (matchingApp) {
        queryClient.setQueryData(queryKeys.applications.mine(), [matchingApp])
      }
      setCheckoutState("passes")
      setErrorMessage(null)
    },
    onError: async (error: any, variables) => {
      const { groupData } = variables
      const groupId = (groupParam || group) as string

      if (
        error instanceof ApiError &&
        (error.status === 409 ||
          (error.body as any)?.detail?.includes("already has an application"))
      ) {
        try {
          const token = window?.localStorage?.getItem("token")
          if (token) {
            const result = await ApplicationsService.listMyApplications()
            const existingApp = result.results.find(
              (app) =>
                app.group_id === groupId || app.popup_id === groupData.popup_id,
            )

            if (existingApp) {
              queryClient.setQueryData(queryKeys.applications.mine(), [
                existingApp,
              ])
              setCheckoutState("passes")
              setErrorMessage(null)
              return
            }
          }
        } catch (subError) {
          console.error("Error retrieving existing application:", subError)
        }

        setErrorMessage(
          "You already have a pending application for this event. Please check your email or contact support.",
        )
      } else {
        const msg =
          error instanceof ApiError
            ? ((error.body as any)?.detail ??
              "Something went wrong. Please try again.")
            : "Something went wrong. Please try again."
        setErrorMessage(msg)
      }

      setCheckoutState("form")
    },
  })

  const handleSubmit = async (
    formData: FormDataProps,
    groupData: any,
  ): Promise<void> => {
    await submitMutation.mutateAsync({ formData, groupData })
  }

  return {
    checkoutState,
    isSubmitting: submitMutation.isPending,
    errorMessage,
    handleSubmit,
    setCheckoutState,
  }
}

export default useCheckoutState
