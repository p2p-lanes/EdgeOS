import { api } from "@/api"
import { PopupsProps } from "@/types/Popups"
import { useEffect, useState } from "react"

const useGetPopups = () => {
  const [popups, setPopups] = useState<PopupsProps[]>([])

  useEffect(() => {
    api.get('popups').then((res) => {
      if(res.status === 200) {
        const data = res.data as PopupsProps[]
        setPopups(data)
      }
    })
  }, [])

  return ({popups})
}
export default useGetPopups