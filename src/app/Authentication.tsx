'use client'

import { ReactNode } from "react"
import useAuthentication from "@/hooks/useAuthentication"
import { Loader } from "@/components/ui/Loader"

const Authentication = ({children}: {children: ReactNode}) => {
  const { isLoading, isAuthenticated } = useAuthentication()
  
  if (isLoading) return <Loader />
  
  if (!isAuthenticated) {
    window.location.href = '/auth'
    return null
  }

  return <>{children}</>
}

export default Authentication