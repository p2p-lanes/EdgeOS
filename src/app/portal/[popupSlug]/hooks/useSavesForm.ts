import { api } from "@/api"
import { toast } from "sonner"
import { getToken } from "@/helpers/getToken"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter } from "next/navigation"

const useSavesForm = () => {
  const token = getToken()
  const { getCity, setApplications, getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()
  const city = getCity()
  const router = useRouter()

  const handleSaveForm = async (formData: Record<string, unknown>) => {
    if(!city || !token) return
    return api.post('applications', { ...formData, citizen_id: token?.citizen_id, popup_city_id: city?.id, status: 'in review' }).then((data) => {
      setApplications((prev: any) => [...prev, data.data])
      toast.success("Application Submitted", {
        description: "Your application has been successfully submitted.",
      })
      router.push('/portal')
    }).catch(() => {
      toast.error("Error Submitting Application", {
        description: "There was an error submitting your application. Please try again.",
      })
    })
  }

  const handleSaveDraft = async (formData: Record<string, unknown>) => {
    if(!city || !token) return

    if(!application?.id) {
      return api.post('applications', { ...formData, citizen_id: token?.citizen_id, popup_city_id: city?.id, status: 'draft' }).then((data) => {
        setApplications((prev: any) => [...prev, data.data])
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

    return api.put(`applications/${application.id}`, { ...formData, citizen_id: token?.citizen_id, popup_city_id: city?.id, status: 'draft' })
      .then((data) => {
        setApplications((prev: any) => [...prev, data.data])
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