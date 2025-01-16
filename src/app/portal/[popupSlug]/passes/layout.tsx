'use client'
import { useCityProvider } from "@/providers/cityProvider"
import PassesProvider from "@/providers/passesProvider"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"

const Layout = ({ children }: { children: ReactNode }) => {
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()
  const router = useRouter()

  useEffect(() => {
    if(!application) return;
    
    if(application.status !== 'accepted'){
      router.replace('./')
      return;
    }
  }, [application])
  
  return (
    <PassesProvider>
      {children}
    </PassesProvider>
  )
}
export default Layout