import { api } from "@/api"
import { toast } from "sonner"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter } from "next/navigation"
import { ApplicationProps } from "@/types/Application"
import useGetTokenAuth from "@/hooks/useGetTokenAuth"

const useSavesForm = () => {
  const { user } = useGetTokenAuth()
  const { getCity, setApplications, getRelevantApplication, getApplications } = useCityProvider()
  const application = getRelevantApplication()
  const city = getCity()
  const router = useRouter()
  const applications = getApplications()

  const createApplication = async (formData: Record<string, unknown>) => {
    return api.post('applications', formData)
  }

  const updateApplication = async (id: number, formData: Record<string, unknown>) => {
    return api.put(`applications/${id}`, formData)
  }

  const handleSaveForm = async (formData: Record<string, unknown>) => {
    if(!city || !user) return

    const data = {
      ...formData,
      citizen_id: user?.citizen_id,
      popup_city_id: city?.id,
      status: 'in review'
    }

    const response = application?.id ? updateApplication(application.id, data) : createApplication(data)
    await response.then((data) => {
      console.log('response', data)
      if(data.status !== 201 && data.status !== 200){
        return
      }

      const newApplication = data.data
      const existingIndex = applications.findIndex((app: ApplicationProps) => app.id === newApplication.id)

      console.log('existingIndex', existingIndex)
      
      const updatedApplications = existingIndex >= 0
        ? applications.map((app: ApplicationProps) => app.id === newApplication.id ? newApplication : app)
        : [...applications, newApplication]
      
      console.log('updatedApplications', updatedApplications)
      
      setApplications(updatedApplications)
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
    if(!city || !user) return

    const data = {
      ...formData,
      citizen_id: user?.citizen_id,
      popup_city_id: city?.id,
      status: 'draft'
    }

    const response = application?.id ? updateApplication(application.id, data) : createApplication(data)

    await response.then((data) => {
      const newApplication = data.data
      const existingIndex = applications.findIndex((app: ApplicationProps) => app.id === newApplication.id)
      
      const updatedApplications = existingIndex >= 0
        ? applications.map((app: ApplicationProps) => app.id === newApplication.id ? newApplication : app)
        : [...applications, newApplication]
      
      setApplications(updatedApplications)
      
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