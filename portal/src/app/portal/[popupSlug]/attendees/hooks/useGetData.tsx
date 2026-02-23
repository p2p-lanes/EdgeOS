import { ApplicationsService } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { queryKeys } from "@/lib/query-keys"
import { useCityProvider } from "@/providers/cityProvider"
import type { AttendeeDirectory } from "@/types/Attendee"

const useGetData = () => {
  const { getCity } = useCityProvider()
  const city = getCity()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [bringsKids, setBringsKids] = useState<boolean | null>(null)
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([])

  const [activeSearch, setActiveSearch] = useState<string>("")
  const [activeBringsKids, setActiveBringsKids] = useState<boolean | null>(null)
  const [activeWeeks, setActiveWeeks] = useState<number[]>([])

  const participationParam = useMemo(() => {
    if (!activeWeeks.length) return undefined
    return activeWeeks.sort((a, b) => a - b).join(",")
  }, [activeWeeks])

  const { data, isLoading: loading } = useQuery({
    queryKey: [
      ...queryKeys.attendees.directory(city?.id ?? ""),
      currentPage,
      pageSize,
      activeSearch,
      activeBringsKids,
      participationParam,
    ],
    queryFn: async () => {
      const result = await ApplicationsService.listAttendeesDirectory({
        popupId: city!.id,
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
        q: activeSearch || undefined,
        bringsKids:
          typeof activeBringsKids === "boolean" ? activeBringsKids : undefined,
        participation: participationParam,
      })
      return {
        items: result.results as AttendeeDirectory[],
        total: result.paging.total,
      }
    },
    enabled: !!city?.id,
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleToggleWeek = (week: number) => {
    setSelectedWeeks((prev) => {
      if (prev.includes(week)) return prev.filter((w) => w !== week)
      return [...prev, week]
    })
  }

  const applyFilters = () => {
    setActiveSearch(searchQuery)
    setActiveBringsKids(bringsKids)
    setActiveWeeks(selectedWeeks)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setBringsKids(null)
    setSelectedWeeks([])
    setActiveSearch("")
    setActiveBringsKids(null)
    setActiveWeeks([])
    setCurrentPage(1)
  }

  return {
    attendees: data?.items ?? [],
    loading,
    totalAttendees: data?.total ?? 0,
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
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
