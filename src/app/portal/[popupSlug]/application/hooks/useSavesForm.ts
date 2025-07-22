import { api } from "@/api"
import { toast } from "sonner"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter } from "next/navigation"
import { ApplicationProps } from "@/types/Application"
import useGetTokenAuth from "@/hooks/useGetTokenAuth"
import { useApplication } from "@/providers/applicationProvider"

interface ApplicationFormData extends Record<string, unknown> {
  gender?: string;
  gender_specify?: string;
  interested_in_residency?: boolean;
  residencies_interested_in?: string[];
}

const useSavesForm = () => {
  const { user } = useGetTokenAuth()
  const { getCity} = useCityProvider()
  const { getRelevantApplication, applications, setApplications } = useApplication()
  const application = getRelevantApplication()
  const city = getCity()
  const router = useRouter()

  const createApplication = async (formData: Record<string, unknown>) => {
    return api.post('applications', formData)
  }

  const updateApplication = async (id: number, formData: Record<string, unknown>) => {
    return api.put(`applications/${id}`, formData)
  }

  const processFormData = (formData: ApplicationFormData) => {
    if (!city || !user) return null;

    let processedData = { ...formData };
    
    // Procesar el género específico
    if (formData.gender === 'Specify' && formData.gender_specify) {
      processedData = {
        ...processedData,
        gender: formData.gender_specify,
      };
      delete processedData.gender_specify;
    }
    
    processedData = {
      ...processedData,
      residencies_interested_in: formData.interested_in_residency ? formData.residencies_interested_in : [],
    }
    
    delete processedData.interested_in_residency

    return {
      ...processedData,
      citizen_id: user.citizen_id,
      popup_city_id: city.id,
    };
  };

  const updateApplicationsList = (newApplication: ApplicationProps) => {
    if (!applications) return;
    
    const existingIndex = applications.findIndex(app => app.id === newApplication.id);
    const updatedApplications = existingIndex >= 0
      ? applications.map(app => app.id === newApplication.id ? newApplication : app)
      : [...applications, newApplication];
    
    setApplications(updatedApplications);
  };

  const handleSubmission = async (
    formData: ApplicationFormData, 
    status: 'draft' | 'in review',
    successMessage: { title: string; description: string },
    errorMessage: { title: string; description: string }
  ) => {

    const processedData = processFormData(formData);
    if (!processedData) {
      toast.error('Error processing form data');
      return;
    }

    const data = { ...processedData, status };

    try {
      const response = await (application?.id 
        ? updateApplication(application.id, data) 
        : createApplication(data));

      if (status === 'in review' && response.status !== 201 && response.status !== 200) {
        toast.error('There was an error submitting your application. Please try again.');
        return {msg: 'Error submitting application', status: response.status, data: response.data};
      }

      updateApplicationsList(response.data);
      
      if(response.status === 201 || response.status === 200){
        toast.success(successMessage.title, {
          description: successMessage.description,
        });
      }


      if(response.status >= 400){
        toast.error(errorMessage.title, {
          description: errorMessage.description,
        });
      }

      if (status === 'in review') {
        router.push(`/portal/${city?.slug}`);
      }
      return response;
    } catch (error) {
      toast.error(errorMessage.title, {
        description: errorMessage.description,
      });
    }
  };

  const handleSaveForm = async (formData: ApplicationFormData) => {
    const response = await handleSubmission(
      formData,
      'in review',
      {
        title: "Application Submitted",
        description: "Your application has been successfully submitted."
      },
      {
        title: "Error Submitting Application",
        description: "There was an error submitting your application. Please try again."
      }
    );
    return response;
  };

  const handleSaveDraft = async (formData: ApplicationFormData) => {
    await handleSubmission(
      formData,
      'draft',
      {
        title: "Draft Saved",
        description: "Your draft has been successfully saved."
      },
      {
        title: "Error Saving Draft",
        description: "There was an error saving your draft. Please try again."
      }
    );
  };

  return ({
    handleSaveDraft,
    handleSaveForm
  })
}
export default useSavesForm