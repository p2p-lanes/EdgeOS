import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { useState } from "react"
import { CreateAttendee } from "@/types/Attendee"
import { useApplication } from "@/providers/applicationProvider"
import { toast } from "sonner"

const useAttendee = () => {
  const [loading, setLoading] = useState(false)
  const { getRelevantApplication, updateApplication } = useApplication()
  const application = getRelevantApplication()

  const addAttendee = async ({name, email, category, gender}: CreateAttendee) => {
    if(!application) return;
    setLoading(true)
    try{
      const response = await api.post(`applications/${application.id}/attendees`, {name, email, category, gender})
      if(response.status === 200){
        updateApplication(response.data)
        return response.data
      }
      if(response.status === 400){
        toast.error(response.data.detail)
      }
    } catch (error) {
      console.error('Error adding attendee:', error)
      // Manejar diferentes tipos de errores
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.")
      } else if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.")
      } else {
        toast.error("Unknown error, please try again later")
      }
    } finally {
      setLoading(false)
    }
  }

  const removeAttendee = async (attendee_id: number) => {
    if(!application) return;
    setLoading(true)
    try{
      const response = await api.delete(`applications/${application.id}/attendees/${attendee_id}`,)
      if(response.status === 200){
        updateApplication(response.data)
        return response.data
      }
      if(response.status === 400){
        toast.error(response.data.detail)
      }
    } catch (error) {
      console.error('Error removing attendee:', error)
      // Manejar diferentes tipos de errores
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.")
      } else if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.")
      } else {
        toast.error("Unknown error, please try again later")
      }
    } finally {
      setLoading(false)
    }
  }

  const editAttendee = async (attendee_id: number, {name, email, category, gender}: CreateAttendee) => {
    if(!application) return;
    setLoading(true)
    try{
      const response = await api.put(`applications/${application.id}/attendees/${attendee_id}`, {name, email, category, gender})
      if(response.status === 200){
        updateApplication(response.data)
        return response.data
      }
      if(response.status === 400){
        toast.error(response.data.detail)
      }
    } catch (error) {
      console.error('Error editing attendee:', error)
      // Manejar diferentes tipos de errores
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.")
      } else if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.")
      } else {
        toast.error("Unknown error, please try again later")
      }
    } finally {
      setLoading(false)
    }
  }

  return ({
    loading,
    addAttendee,
    removeAttendee,
    editAttendee
  })
}
export default useAttendee