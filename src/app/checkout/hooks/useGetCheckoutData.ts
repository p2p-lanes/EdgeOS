import { instance } from "@/api"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"



const useGetCheckoutData = () => {
  const searchParams = useSearchParams()
  const groupParam = searchParams.get("group")
  const [group, setGroup] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getGroup = async () => {
    setIsLoading(true)
    try{
      const response = await instance.get(`/groups/aux/${groupParam}`, {
        headers: {
          'api-key': process.env.NEXT_PUBLIC_X_API_KEY
        }
      })
      console.log(response.data)
      setGroup(response.data)
      setIsLoading(false)
    } catch (error: any) {
      setError(`Error fetching group data: ${error.response.data.detail}`)
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getGroup()
  }, [groupParam])

  return { data: { group }, error, isLoading }
}
export default useGetCheckoutData