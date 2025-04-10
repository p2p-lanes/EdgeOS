import { api } from "@/api"
import { useEffect, useState } from "react"

const useGetGroups = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [groups, setGroups] = useState<any[]>([])

  const getGroups = async () => {
    setIsLoading(true)
    const response = await api.get('/groups')
    setGroups(response.data)
    setIsLoading(false)
  }

  useEffect(() => {
    getGroups()
  }, [])

  return { groups, isLoading }
}
export default useGetGroups