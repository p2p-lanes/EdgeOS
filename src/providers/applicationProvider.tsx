"use client";

import { ApplicationProps } from "@/types/Application";
import { AttendeeProps } from "@/types/Attendee";
import { createContext, ReactNode, useContext, useState, useCallback } from "react"
import { useCityProvider } from "./cityProvider";

interface ApplicationContextProps {
  applications: ApplicationProps[] | null;
  setApplications: (applications: ApplicationProps[]) => void;
  getRelevantApplication: () => ApplicationProps | null;
  getAttendees: () => AttendeeProps[];
  updateApplication: (application: ApplicationProps) => void;
}

export const ApplicationContext = createContext<ApplicationContextProps | null>(null);

const ApplicationProvider = ({ children }: { children: ReactNode }) => {
  const [applications, setApplications] = useState<ApplicationProps[] | null>(null);
  const { getCity } = useCityProvider()

  const updateApplication = useCallback((application: ApplicationProps): void => {
    setApplications(currentApplications => {
      if(!currentApplications) {
        return currentApplications;
      }
      const newApplications = currentApplications.filter(ap => ap.id !== application.id)
      
      const updatedApplications = [...newApplications, application]
      
      // Forzar que React detecte el cambio usando JSON para romper referencias
      const freshApplication = JSON.parse(JSON.stringify(application))
      const finalApplications = [...newApplications, freshApplication]
      
      return finalApplications
    })
  }, [])

  const getRelevantApplication = useCallback((): ApplicationProps | null => {
    const city = getCity()
    if(!applications) return null;

    return applications?.filter((app: ApplicationProps) => app.popup_city_id === city?.id)?.slice(-1)[0]
  }, [applications, getCity])

  const getAttendees = useCallback((): AttendeeProps[] => {
    const application = getRelevantApplication()
    if(!application) return [];
    return application.attendees || [];
  }, [getRelevantApplication])
  
  return (
    <ApplicationContext.Provider 
      value={{ 
        applications, 
        setApplications,
        getRelevantApplication,
        getAttendees,
        updateApplication
      }}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
}

export default ApplicationProvider