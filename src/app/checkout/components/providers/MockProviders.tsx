"use client"

import { ReactNode, useEffect } from "react"
import PassesProvider from "@/providers/passesProvider"
import TotalProvider from "@/providers/totalProvider"
import ApplicationProvider, { useApplication } from "@/providers/applicationProvider"
import CityProvider, { useCityProvider } from "@/providers/cityProvider"
import { APPLICATION_DATA, POPUPS } from "../../constants/application"
import { ApplicationProps } from "@/types/Application"
import { AttendeeProps } from "@/types/Attendee"
import { instance } from "@/api"
import { TooltipProvider } from "@/components/ui/tooltip"

interface MockProvidersProps {
  children: ReactNode
  applicationData: any
}

// Función auxiliar para adaptar los datos mockeados al formato esperado
const adaptApplicationData = (data: any): ApplicationProps => {
  // Asegurarse de que los attendees tengan el formato correcto
  const adaptedAttendees: AttendeeProps[] = data.attendees.map((attendee: any) => ({
    ...attendee,
    // Asegurarse de que la categoría es del tipo correcto
    category: attendee.category as "main" | "spouse" | "kid" | "teen" | "baby",
    // Asegurarse de que products existe y tiene el formato adecuado
    products: attendee.products || []
  }))

  return {
    ...data,
    attendees: adaptedAttendees
  } as ApplicationProps
}

const MockProviders = ({ children, applicationData }: MockProvidersProps) => {
  // El componente va a inicializar los providers con los datos mockeados

  return (
    <TooltipProvider>
      <CityProvider>
        <PopupsInitializer>
          <ApiTokenInitializer>
            <ApplicationProvider>
              <AppDataInitializer applicationData={applicationData}>
                <PassesProvider>
                  <TotalProvider>
                    {children}
                  </TotalProvider>
                </PassesProvider>
              </AppDataInitializer>
            </ApplicationProvider>
          </ApiTokenInitializer>
        </PopupsInitializer>
      </CityProvider>
    </TooltipProvider>
  )
}

// Componente para inicializar los popups
const PopupsInitializer = ({ children }: { children: ReactNode }) => {
  const { setPopups } = useCityProvider()
  
  useEffect(() => {
    // Inicializar los datos de los popups
    setPopups(POPUPS)
  }, [setPopups])

  return <>{children}</>
}

// Componente para inicializar el token API
const ApiTokenInitializer = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Establecer el token de API para las solicitudes de BuyPasses
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaXRpemVuX2lkIjoyLCJlbWFpbCI6ImpvZWxAbXV2aW5haS5jb20ifQ.v6LE0Ji2NZErTRBiWK5MjquHvZFiX5gHvfT0Z-RiBi8"
    
    // Guardar el token en localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('token', token)
    }
    
    // Configurar el token en las cabeceras de las solicitudes API
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    console.log('API token configurado para checkout')
  }, [])

  return <>{children}</>
}

// Componente auxiliar para inicializar datos de aplicación
const AppDataInitializer = ({ 
  children, 
  applicationData 
}: { 
  children: ReactNode
  applicationData: any 
}) => {
  const { setApplications } = useApplication()

  useEffect(() => {
    // Inicializar los datos de la aplicación adaptándolos al formato correcto
    if (applicationData) {
      setApplications([adaptApplicationData(applicationData)])
    } else {
      // Si no nos pasan datos, usar los mockeados
      setApplications([adaptApplicationData(APPLICATION_DATA)])
    }
  }, [applicationData, setApplications])

  return <>{children}</>
}

export default MockProviders 