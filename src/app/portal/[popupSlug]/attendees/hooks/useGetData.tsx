import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { AttendeeDirectory } from "@/types/Attendee"
import { useEffect, useMemo, useState } from "react"

const useGetData = () => {
  const [attendees, setAttendees] = useState<AttendeeDirectory[]>([])
  const [totalAttendees, setTotalAttendees] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const { getCity } = useCityProvider()
  const city = getCity()

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [bringsKids, setBringsKids] = useState<boolean | null>(null)
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([])

  const participationParam = useMemo(() => {
    if (!selectedWeeks.length) return undefined
    return selectedWeeks.sort((a, b) => a - b).join(",")
  }, [selectedWeeks])

  type FiltersOverride = {
    q?: string | null
    brings_kids?: boolean | null
    participation?: string | null
  }

  const getAttendees = async (page = 1, size = 10, override?: FiltersOverride) => {
    if (!city) return
    setLoading(true)
    try {
      const q = override ? (override.q === null ? undefined : override.q) : searchQuery
      const brings_kids = override ? (override.brings_kids === null ? undefined : override.brings_kids) : (typeof bringsKids === 'boolean' ? bringsKids : undefined)
      const participation = override ? (override.participation === null ? undefined : override.participation) : participationParam
      const response = await api.get(`applications/attendees_directory/${city?.id}`, {
        params: {
          skip: (page - 1) * size,
          limit: pageSize,
          ...(q ? { q } : {}),
          ...(typeof brings_kids === 'boolean' ? { brings_kids } : {}),
          ...(participation ? { participation } : {}),
        }
      })
      if (response.status === 200) {
        setAttendees(response.data.items)
        setTotalAttendees(response.data.pagination.total)
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    getAttendees(currentPage, pageSize)
  }, [city])

  // Public helpers for filters
  const handleToggleWeek = (week: number) => {
    setSelectedWeeks(prev => {
      if (prev.includes(week)) return prev.filter(w => w !== week)
      return [...prev, week]
    })
  }

  const applyFilters = () => {
    setCurrentPage(1)
    getAttendees(1, pageSize)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setBringsKids(null)
    setSelectedWeeks([])
    setCurrentPage(1)
    // Force request with empty filters to avoid race with state updates
    getAttendees(1, pageSize, { q: null, brings_kids: null, participation: null })
  }

  return { 
    attendees, 
    loading, 
    totalAttendees, 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handlePageSizeChange,
    // filters
    searchQuery,
    setSearchQuery,
    bringsKids,
    setBringsKids,
    selectedWeeks,
    handleToggleWeek,
    applyFilters,
    clearFilters,
  }
}

export default useGetData