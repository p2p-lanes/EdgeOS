"use client"

import { useMemo } from "react"
import { useGroupsQuery } from "@/components/Sidebar/hooks/useGetGroups"
import { useApplication } from "@/providers/applicationProvider"
import { useDiscount } from "@/providers/discountProvider"
import { usePassesProvider } from "@/providers/passesProvider"
import { TotalCalculator } from "@/strategies/TotalStrategy"

export function useCalculateTotal() {
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const { attendeePasses } = usePassesProvider()
  const { discountApplied } = useDiscount()
  const { data: groups = [] } = useGroupsQuery()

  return useMemo(() => {
    let groupDiscountValue = 0
    let groupNameValue: string | null = null

    if (application?.group_id && groups.length > 0) {
      const group = groups.find((g) => g.id === application.group_id)
      if (group?.discount_percentage) {
        groupDiscountValue = Number(group.discount_percentage)
        groupNameValue = group.name
      }
    }

    const calculator = new TotalCalculator()
    const result = calculator.calculate(
      attendeePasses,
      discountApplied,
      groupDiscountValue,
    )
    const balance = result.total

    return {
      total: balance,
      originalTotal: result.originalTotal,
      discountAmount: result.discountAmount,
      balance,
      groupDiscountPercentage: groupDiscountValue,
      groupName: groupNameValue,
    }
  }, [application, attendeePasses, discountApplied, groups])
}
