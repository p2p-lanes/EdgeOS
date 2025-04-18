'use client'
import { useApplication } from "@/providers/applicationProvider"
import PassesProvider from "@/providers/passesProvider"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"
import TotalProvider from "@/providers/totalProvider"

const Layout = ({ children }: { children: ReactNode }) => {
  const { getRelevantApplication } = useApplication()
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
      <TotalProvider>
        <div className="py-6">
          {children}
        </div>
      </TotalProvider>
    </PassesProvider>
  )
}
export default Layout