"use client"

import { GroupsService } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { queryKeys } from "@/lib/query-keys"
import { useCityProvider } from "@/providers/cityProvider"
import { useDiscount } from "@/providers/discountProvider"

const useGetInviteData = () => {
  const { group } = useParams()
  const groupSlug = group as string | undefined
  const { setCityPreselected } = useCityProvider()
  const { setDiscount } = useDiscount()

  const {
    data: groupData,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.groups.public(groupSlug ?? ""),
    queryFn: async () => {
      return GroupsService.getGroupPublic({ groupSlug: groupSlug! })
    },
    enabled: !!groupSlug,
  })

  useEffect(() => {
    if (!groupData) return
    setCityPreselected(groupData.popup_id)
    setDiscount({
      discount_value: Number(groupData.discount_percentage ?? 0),
      discount_type: "percentage",
      city_id: groupData.popup_id,
    })
  }, [groupData, setCityPreselected, setDiscount])

  return {
    data: { group: groupData ?? null },
    error: error?.message ?? null,
    isLoading,
  }
}
export default useGetInviteData
