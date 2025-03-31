"use client"

import { ReactNode, useEffect } from "react"
import { useCityProvider } from "@/providers/cityProvider"
import { POPUPS } from "../../constants/application"
import { TooltipProvider } from "@/components/ui/tooltip"

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
  
  useEffect(() => {
    // Inicializar los datos de los popups
    setPopups(POPUPS)
  }, [setPopups])

  return <>{children}</>
}

export default Providers 