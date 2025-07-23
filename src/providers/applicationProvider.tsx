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
    console.log('[ApplicationProvider] updateApplication called with app ID:', application.id)
    console.log('[ApplicationProvider] New application attendees count:', application.attendees?.length)
    console.log('[ApplicationProvider] New application attendees IDs:', application.attendees?.map(a => a.id))
    setApplications(currentApplications => {
      if(!currentApplications) {
        console.log('[ApplicationProvider] No applications to update')
        return currentApplications;
      }
      console.log('[ApplicationProvider] Current applications before update:', currentApplications.length)
      console.log('[ApplicationProvider] Current app attendees IDs:', currentApplications.find(app => app.id === application.id)?.attendees?.map(a => a.id))
      
      const newApplications = currentApplications.filter(ap => ap.id !== application.id)
      console.log('[ApplicationProvider] Filtered applications, remaining:', newApplications.length)
      
      const updatedApplications = [...newApplications, application]
      console.log('[ApplicationProvider] Updated applications, new total:', updatedApplications.length)
      console.log('[ApplicationProvider] Updated application attendees IDs:', application.attendees?.map(a => a.id))
      
      // Forzar que React detecte el cambio usando JSON para romper referencias
      const freshApplication = JSON.parse(JSON.stringify(application))
      const finalApplications = [...newApplications, freshApplication]
      console.log('[ApplicationProvider] Using fresh application object')
      
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