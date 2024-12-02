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

  const createApplication = async (formData: Record<string, unknown>) => {
    return api.post('applications', formData)
  }

  const updateApplication = async (id: string, formData: Record<string, unknown>) => {
    return api.put(`applications/${id}`, formData)
  }

  const handleSaveForm = async (formData: Record<string, unknown>) => {
    if(!city || !token) return

    const data = {
      ...formData,
      citizen_id: token?.citizen_id,
      popup_city_id: city?.id,
      status: 'in review'
    }

    const response = application?.id ? updateApplication(application.id, data) : createApplication(data)
      
    response.then((data) => {
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

    const data = {
      ...formData,
      citizen_id: token?.citizen_id,
      popup_city_id: city?.id,
      status: 'draft'
    }

    const response = application?.id ? updateApplication(application.id, data) : createApplication(data)

    response.then((data) => {
      setApplications((prev: any) => [...prev, data.data])
      toast.success("Draft Saved", {
        description: "Your draft has been successfully saved.",
      })
    }).catch(() => {
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