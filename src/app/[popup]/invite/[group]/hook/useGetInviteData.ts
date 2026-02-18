"use client";

import { api, instance } from "@/api"
import { useCityProvider } from "@/providers/cityProvider";
import { usePassesProvider } from "@/providers/passesProvider";
import { PopupsProps } from "@/types/Popup";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

const useGetInviteData = () => {
  const { group } = useParams()
  const [groupData, setGroupData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setCityPreselected, setPopups } = useCityProvider()
  const { setDiscount } = usePassesProvider()

  const getGroup = async () => {
    setIsLoading(true)
    try {
      const token = window?.localStorage?.getItem('token')
      if (token) {
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }

      const [groupResponse, popupsResponse] = await Promise.all([
        instance.get(`/groups/aux/${group}`, {
          headers: { 'api-key': process.env.NEXT_PUBLIC_X_API_KEY }
        }),
        api.get('popups')
      ])

      const popups = popupsResponse.data as PopupsProps[]
      setPopups([...popups].reverse())

      const popupCity = popups.find(
        (popup) => popup.id === groupResponse.data.popup_city_id
      )

      if (!popupCity?.visible_in_portal || !popupCity?.clickable_in_portal) {
        setError("This invite link is no longer valid")
        return
      }

      setGroupData(groupResponse.data)
      setCityPreselected(groupResponse.data.popup_city_id)
      setDiscount({
        discount_value: groupResponse.data.discount_percentage,
        discount_type: 'percentage',
        city_id: groupResponse.data.popup_city_id
      })
    } catch (error: any) {
      setError(`Error fetching group data: ${error.response?.data?.detail ?? 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getGroup()
  }, [group])

  return { data: { group: groupData }, error, isLoading }
}
export default useGetInviteData