"use client";

import { instance } from "@/api"
import { useCityProvider } from "@/providers/cityProvider";
import { usePassesProvider } from "@/providers/passesProvider";
import useGetPopups from "@/hooks/useGetPopups";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

const useGetInviteData = () => {
  const { group } = useParams()
  const [groupData, setGroupData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setCityPreselected, getPopups, popupsLoaded } = useCityProvider()
  const { setDiscount } = usePassesProvider()
  useGetPopups()

  const getGroup = async () => {
    setIsLoading(true)
    try {
      const response = await instance.get(`/groups/aux/${group}`, {
        headers: { 'api-key': process.env.NEXT_PUBLIC_X_API_KEY }
      })
      setGroupData(response.data)
    } catch (error: any) {
      setError(`Error fetching group data: ${error.response?.data?.detail ?? 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getGroup()
  }, [group])

  useEffect(() => {
    if (!popupsLoaded || !groupData) return

    const popups = getPopups()
    const popupCity = popups.find((popup) => popup.id === groupData.popup_city_id)

    if (!popupCity?.visible_in_portal || !popupCity?.clickable_in_portal) {
      setError("This popup city is not currently available")
      return
    }

    setCityPreselected(groupData.popup_city_id)
    setDiscount({
      discount_value: groupData.discount_percentage,
      discount_type: 'percentage',
      city_id: groupData.popup_city_id
    })
  }, [popupsLoaded, groupData])

  return { data: { group: groupData }, error, isLoading }
}
export default useGetInviteData