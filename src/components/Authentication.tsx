'use client'

import { ReactNode, useEffect } from "react"
import useAuthentication from "@/hooks/useAuthentication"
import { Loader } from "@/components/ui/Loader"

const Authentication = ({children}: {children: ReactNode}) => {
  const { isLoading, isAuthenticated, logout } = useAuthentication()
  
  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated)
    console.log("isLoading", isLoading)
    if(!isAuthenticated && !isLoading) {
      logout()
    }
  }, [isAuthenticated, isLoading])
  
  if (isLoading) return <Loader />

  return isAuthenticated ? <>{children}</> : null
}

export default Authentication