import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { AttendeeDirectory } from "@/types/Attendee"
import { useEffect, useState } from "react"

const useGetData = () => {
  const [attendees, setAttendees] = useState<AttendeeDirectory[]>([])
  const [totalAttendees, setTotalAttendees] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const { getCity } = useCityProvider()
  const city = getCity()

  const getAttendees = async (page = 1, size = 10) => {
    if (!city) return
    setLoading(true)
    try {
      const response = await api.get(`applications/attendees_directory/${city?.id}`, {
        params: {
          page,
          page_size: size
        }
      })
      if (response.status === 200) {
        setAttendees(response.data.results || response.data)
        setTotalAttendees(response.data.count || response.data.length)
      }
    } catch (error) {
      console.error("Error fetching attendees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    getAttendees(page, pageSize)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
    getAttendees(1, size)
  }

  useEffect(() => {
    getAttendees(currentPage, pageSize)
  }, [city])

  return { 
    attendees, 
    loading, 
    totalAttendees, 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handlePageSizeChange 
  }
}

export default useGetData