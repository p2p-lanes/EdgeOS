import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { AttendeeDirectory } from "@/types/Attendee"
import { useEffect, useState } from "react"

const useGetData = () => {
  const [attendees, setAttendees] = useState<AttendeeDirectory[]>([])
  const { getCity } = useCityProvider()
  const city = getCity()

  const getAttendees = async () => {
    if (!city) return
    const response = await api.get(`applications/attendees_directory/${city?.id}`)
    if (response.status === 200) {
      setAttendees(response.data)
    }
  }

  useEffect(() => {
    getAttendees()
  }, [city])

  return { attendees }
}
export default useGetData