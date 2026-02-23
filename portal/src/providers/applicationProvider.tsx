"use client"

import type { ApplicationPublic } from "@edgeos/api-client"
import { useQueryClient } from "@tanstack/react-query"
import { createContext, type ReactNode, useCallback, useContext } from "react"
import { useApplicationsQuery } from "@/hooks/useGetApplications"
import { queryKeys } from "@/lib/query-keys"
import type { AttendeePassState } from "@/types/Attendee"
import { useCityProvider } from "./cityProvider"

interface ApplicationContextProps {
  applications: ApplicationPublic[] | null
  getRelevantApplication: () => ApplicationPublic | null
  getAttendees: () => AttendeePassState[]
  updateApplication: (application: ApplicationPublic) => void
}

export const ApplicationContext = createContext<ApplicationContextProps | null>(
  null,
)

const ApplicationProvider = ({ children }: { children: ReactNode }) => {
  const { data: applications = null } = useApplicationsQuery()
  const { getCity } = useCityProvider()
  const queryClient = useQueryClient()

  const updateApplication = useCallback(
    (application: ApplicationPublic): void => {
      queryClient.setQueryData<ApplicationPublic[]>(
        queryKeys.applications.mine(),
        (old) => {
          if (!old) return old
          const filtered = old.filter((ap) => ap.id !== application.id)
          const freshApplication = JSON.parse(JSON.stringify(application))
          return [...filtered, freshApplication]
        },
      )
    },
    [queryClient],
  )

  const getRelevantApplication = useCallback((): ApplicationPublic | null => {
    const city = getCity()
    if (!applications) return null

    return (
      applications
        ?.filter((app: ApplicationPublic) => app.popup_id === city?.id)
        ?.slice(-1)[0] ?? null
    )
  }, [applications, getCity])

  const getAttendees = useCallback((): AttendeePassState[] => {
    const application = getRelevantApplication()
    if (!application) return []
    return (application.attendees ?? []).map((att) => ({
      ...att,
      products: [], // products are populated by passesProvider from the products query
    }))
  }, [getRelevantApplication])

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        getRelevantApplication,
        getAttendees,
        updateApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export const useApplication = () => {
  const context = useContext(ApplicationContext)
  if (!context) {
    throw new Error("useApplication must be used within an ApplicationProvider")
  }
  return context
}

export default ApplicationProvider
