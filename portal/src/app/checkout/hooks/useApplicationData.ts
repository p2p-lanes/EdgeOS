import { ApplicationsService } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { jwtDecode } from "jwt-decode"
import { queryKeys } from "@/lib/query-keys"
import type { FormDataProps } from "../types"

interface ExtendedApplicationData extends Partial<FormDataProps> {
  red_flag?: boolean
  popup?: {
    id: string
    name: string
    slug: string
    [key: string]: any
  }
}

interface UseApplicationDataProps {
  groupPopupCityId?: string
}

export const useApplicationData = ({
  groupPopupCityId,
}: UseApplicationDataProps) => {
  const {
    data: applicationData = null,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: [...queryKeys.applications.mine(), "checkout", groupPopupCityId],
    queryFn: async (): Promise<ExtendedApplicationData | null> => {
      const token = window?.localStorage?.getItem("token")
      if (!token) return null

      const decodedToken = jwtDecode(token) as { email: string }
      if (!decodedToken.email) return null

      const result = await ApplicationsService.listMyApplications()
      const matchingApp = result.results.find(
        (app) => app.popup_id === groupPopupCityId,
      )

      if (matchingApp) {
        return {
          first_name: matchingApp.human?.first_name || "",
          last_name: matchingApp.human?.last_name || "",
          email: decodedToken.email,
          telegram: matchingApp.human?.telegram || "",
          organization: matchingApp.human?.organization || "",
          role: matchingApp.human?.role || "",
          gender: matchingApp.human?.gender?.toLowerCase() || "",
          email_verified: true,
          local_resident: "",
          red_flag: matchingApp.red_flag || false,
        }
      }

      return {
        email: decodedToken.email,
        email_verified: true,
        red_flag: false,
      }
    },
    enabled: !!groupPopupCityId,
  })

  return {
    isLoading,
    error: queryError?.message ?? null,
    applicationData,
    refreshApplicationData: () => {},
  }
}
