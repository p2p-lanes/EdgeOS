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
    console.log('[useAttendee] Starting removeAttendee for ID:', attendee_id)
    setLoading(true)
    try{
      const response = await api.delete(`applications/${application.id}/attendees/${attendee_id}`,)
      console.log('[useAttendee] removeAttendee response status:', response.status)
      if(response.status === 200){
        console.log('[useAttendee] Updating application after successful deletion')
        updateApplication(response.data)
        return response.data
      }
      if(response.status === 400){
        console.log('[useAttendee] Bad request error:', response.data.detail)
        toast.error(response.data.detail)
      }
    } catch (error) {
      console.error('[useAttendee] Error removing attendee:', error)
      // Manejar diferentes tipos de errores
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.")
      } else if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.")
      } else {
        toast.error("Unknown error, please try again later")
      }
    } finally {
      console.log('[useAttendee] removeAttendee finished, setting loading to false')
      setLoading(false)
    }
  }

  const editAttendee = async (attendee_id: number, {name, email, category, gender}: CreateAttendee) => {
    if(!application) return;
    console.log('[useAttendee] Starting editAttendee for ID:', attendee_id)
    setLoading(true)
    try{
      const response = await api.put(`applications/${application.id}/attendees/${attendee_id}`, {name, email, category, gender})
      console.log('[useAttendee] editAttendee response status:', response.status)
      if(response.status === 200){
        console.log('[useAttendee] Updating application after successful edit')
        updateApplication(response.data)
        return response.data
      }
      if(response.status === 400){
        console.log('[useAttendee] Bad request error:', response.data.detail)
        toast.error(response.data.detail)
      }
    } catch (error) {
      console.error('[useAttendee] Error editing attendee:', error)
      // Manejar diferentes tipos de errores
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.")
      } else if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.")
      } else {
        toast.error("Unknown error, please try again later")
      }
    } finally {
      console.log('[useAttendee] editAttendee finished, setting loading to false')
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