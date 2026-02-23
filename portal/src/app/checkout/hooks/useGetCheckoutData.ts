"use client"

import { GroupsService } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { queryKeys } from "@/lib/query-keys"
import { useCityProvider } from "@/providers/cityProvider"
import { useDiscount } from "@/providers/discountProvider"

const useGetCheckoutData = () => {
  const searchParams = useSearchParams()
  const groupParam = searchParams.get("group")
  const { setCityPreselected } = useCityProvider()
  const { setDiscount } = useDiscount()

  const {
    data: group,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.groups.public(groupParam ?? ""),
    queryFn: async () => {
      return GroupsService.getGroupPublic({ groupSlug: groupParam! })
    },
    enabled: !!groupParam,
  })

  useEffect(() => {
    if (!group) return
    setCityPreselected(group.popup_id)
    setDiscount({
      discount_value: Number(group.discount_percentage ?? 0),
      discount_type: "percentage",
      city_id: group.popup_id,
    })
  }, [group, setCityPreselected, setDiscount])

  return {
    data: { group: group ?? null },
    error: error?.message ?? null,
    isLoading,
  }
}
export default useGetCheckoutData
