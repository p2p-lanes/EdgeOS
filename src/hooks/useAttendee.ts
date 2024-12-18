import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { useState } from "react"
import { CreateAttendee } from "@/types/Attendee"

const useAttendee = () => {
  const [loading, setLoading] = useState(false)
  const { getRelevantApplication, updateApplication } = useCityProvider()
  const application = getRelevantApplication()

  const addAttendee = async ({name, email, category}: CreateAttendee) => {
    setLoading(true)
    try{
      const response = await api.post(`applications/${application.id}/attendees`, {name, email, category})
      if(response.status === 200){
        updateApplication(response.data)
        return response.data
      }
    }catch{
      console.log('error create attende')
    }finally{
      setLoading(false)
    }
  }

  const removeAttendee = async (attendee_id: number) => {
    setLoading(true)
    try{
      const response = await api.delete(`applications/${application.id}/attendees/${attendee_id}`,)
      if(response.status === 200){
        updateApplication(response.data)
        return response.data
      }
    }catch{
      console.log('error create attende')
    }finally{
      setLoading(false)
    }
  }

  return ({
    loading,
    addAttendee,
    removeAttendee
  })
}
export default useAttendee