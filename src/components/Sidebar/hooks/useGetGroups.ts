import { api } from "@/api"
import { useGroupsProvider } from "@/providers/groupsProvider"
import { useCallback, useEffect } from "react"

const useGetGroups = () => {
  const { groups, setGroups, loading, setLoading } = useGroupsProvider()

  const getGroups = useCallback(async () => {
    // If groups already exist, return without fetching
    if (groups.length > 0) {
      return
    }

    setLoading(true)
    try {
      const response = await api.get('/groups')
      setGroups(response.data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }, [groups.length, setGroups, setLoading])

  useEffect(() => {
    getGroups()
  }, [getGroups])

  return { groups, isLoading: loading, refetch: getGroups }
}
export default useGetGroups