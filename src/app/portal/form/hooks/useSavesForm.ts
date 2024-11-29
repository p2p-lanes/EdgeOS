import { api } from "@/api"
import { toast } from "sonner"
import { getToken } from "@/helpers/getToken"
import { useCityProvider } from "@/providers/cityProvider"

const useSavesForm = () => {
  const token = getToken()
  const { getCity, setApplication } = useCityProvider()
  const city = getCity()

  const handleSaveForm = async (formData: Record<string, unknown>) => {
    if(!city || !token) return
    return api.post('applications', { ...formData, citizen_id: token?.citizen_id, popup_city_id: city?.id, status: 'in review' }).then(() => {
      toast.success("Application Submitted", {
        description: "Your application has been successfully submitted.",
      })
    }).catch(() => {
      toast.error("Error Submitting Application", {
        description: "There was an error submitting your application. Please try again.",
      })
    })
  }

  const handleSaveDraft = async (formData: Record<string, unknown>) => {
    if(!city || !token) return

    if(!formData.id) {
      return api.post('applications', { ...formData, citizen_id: token?.citizen_id, popup_city_id: city?.id, status: 'draft' }).then((data) => {
        setApplication(data.data)
        toast.success("Draft Saved", {
          description: "Your draft has been successfully saved.",
        })
      })
      .catch(() => {
        toast.error("Error Saving Draft", {
          description: "There was an error saving your draft. Please try again.",
        })
      })
    }

    return api.put(`applications/${formData.id}`, { ...formData, citizen_id: token?.citizen_id, popup_city_id: city?.id, status: 'draft' })
      .then((data) => {
        setApplication(data.data)
        toast.success("Draft Saved", {
          description: "Your draft has been successfully saved.",
        })
      })
      .catch(() => {
        toast.error("Error Saving Draft", {
          description: "There was an error saving your draft. Please try again.",
        })
      })
  }

  return ({
    handleSaveDraft,
    handleSaveForm
  })
}
export default useSavesForm