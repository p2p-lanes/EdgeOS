import { useState, useEffect } from "react"
import { api } from "@/api"
import useGetTokenAuth from "./useGetTokenAuth"
import useAuthentication from "./useAuthentication"
import { ApplicationProps } from "@/types/Application"

import { GroupProps } from "@/types/Group"
interface UseGetGroupResult {
  group: GroupProps | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const useGetGroup = (groupId: string | null): UseGetGroupResult => {
  const [group, setGroup] = useState<GroupProps | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useGetTokenAuth()
  const { logout } = useAuthentication()

  const fetchGroup = async () => {
    if (!groupId || !user) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.get(`groups/${groupId}`)

      if (response.status === 200) {
        setGroup(response.data)
      }
    } catch (err: any) {
      console.error('Error fetching group:', err)
      if (err.response?.status === 401) {
        logout()
      }
      setError(err.response?.data?.message || 'Error loading group data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroup()
  }, [groupId, user])

  return { group, loading, error, refetch: fetchGroup }
}

export default useGetGroup 