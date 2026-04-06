import { api } from "@/api"
import { toast } from "sonner"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter } from "next/navigation"
import { ApplicationProps } from "@/types/Application"
import useGetTokenAuth from "@/hooks/useGetTokenAuth"
import { useApplication } from "@/providers/applicationProvider"
import { AttendeeCategory } from "@/types/Attendee"

interface ApplicationFormData extends Record<string, unknown> {
  gender?: string;
  gender_specify?: string;
  interested_in_residency?: boolean;
  residencies_interested_in?: string[];
}

const getKidCategory = (age: string): AttendeeCategory => {
  if (age === '< 1' || age === '1' || age === '2') return 'baby';
  const ageNum = parseInt(age);
  if (ageNum >= 3 && ageNum <= 6) return 'younger kid';
  if (ageNum >= 7 && ageNum <= 12) return 'kid';
  return 'teen';
};

const createKidAttendees = async (applicationId: number, kidsInfo: string, existingAttendees: any[]): Promise<ApplicationProps | null> => {
  const kidEntries = kidsInfo.split('.').filter(e => e.trim());
  const existingKidNames = existingAttendees
    .filter(a => ['baby', 'kid', 'teen'].includes(a.category))
    .map(a => a.name.toLowerCase());

  let lastApplication: ApplicationProps | null = null;

  for (const entry of kidEntries) {
    const parts = entry.trim().split(',').map(p => p.trim());
    if (parts.length < 2) continue;
    const [name, age, gender = ''] = parts;
    if (!name || !age) continue;
    if (existingKidNames.includes(name.toLowerCase())) continue;

    const response = await api.post(`applications/${applicationId}/attendees`, {
      name,
      email: '',
      category: getKidCategory(age),
      gender,
    });
    if (response.status === 200 && response.data) {
      lastApplication = response.data;
    }
  }

  return lastApplication;
};

const saveNannyAttendee = async (
  applicationId: number,
  nannyName: string,
  nannyEmail: string,
  existingAttendees: any[]
): Promise<ApplicationProps | null> => {
  const existingNanny = existingAttendees.find(a => a.category === 'nanny');

  if (existingNanny) {
    if (existingNanny.name === nannyName && existingNanny.email === nannyEmail) return null;
    const response = await api.put(`applications/${applicationId}/attendees/${existingNanny.id}`, {
      name: nannyName,
      email: nannyEmail,
      category: 'nanny',
      gender: existingNanny.gender || '',
    });
    return response.status === 200 ? response.data : null;
  }

  const response = await api.post(`applications/${applicationId}/attendees`, {
    name: nannyName,
    email: nannyEmail,
    category: 'nanny',
    gender: '',
  });
  return response.status === 200 ? response.data : null;
};

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
    
    const normalizedLocalResident = typeof formData.local_resident === 'string'
      ? (formData.local_resident === 'yes' ? true : formData.local_resident === 'no' ? false : null)
      : (formData.local_resident as boolean | null)

    processedData = {
      ...processedData,
      residencies_interested_in: formData.interested_in_residency ? formData.residencies_interested_in : [],
      local_resident: normalizedLocalResident,
    }
    
    delete processedData.interested_in_residency
    delete processedData.brings_nanny
    delete processedData.nanny_name
    delete processedData.nanny_email

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

      let latestAttendees = response.data.attendees || [];

      if (status === 'in review' && formData.brings_kids && formData.kids_info) {
        const updatedApplication = await createKidAttendees(
          response.data.id,
          formData.kids_info as string,
          latestAttendees
        );
        if (updatedApplication) {
          updateApplicationsList(updatedApplication);
          latestAttendees = updatedApplication.attendees || latestAttendees;
        }
      }

      if (formData.brings_nanny && formData.nanny_name) {
        const nannyResult = await saveNannyAttendee(
          response.data.id,
          formData.nanny_name as string,
          (formData.nanny_email as string) || '',
          latestAttendees
        );
        if (nannyResult) {
          updateApplicationsList(nannyResult);
        }
      }

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