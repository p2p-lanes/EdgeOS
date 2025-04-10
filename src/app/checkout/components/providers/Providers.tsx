"use client"

import { ReactNode, useEffect } from "react"
import { useCityProvider } from "@/providers/cityProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import useGetPopups from "@/hooks/useGetPopups"
import { api } from "@/api"

interface MockProvidersProps {
  children: ReactNode
}

const Providers = ({ children }: MockProvidersProps) => {

  return (
    <TooltipProvider>
      <PopupsInitializer>
        {children}
      </PopupsInitializer>
    </TooltipProvider>
  )
}

// Componente para inicializar los popups
const PopupsInitializer = ({ children }: { children: ReactNode }) => {
  const { setPopups } = useCityProvider()

  const getPopups = async () => {
    const response = await api.get('popups')
    setPopups(response.data.reverse())
  }
  
  useEffect(() => {
    getPopups()
  }, [])

  return <>{children}</>
}

export default Providers 