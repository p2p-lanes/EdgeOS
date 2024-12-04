'use client'
import { Loader } from "@/components/ui/Loader"
import useAuthentication from "@/hooks/useAuthentication"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const Page = () => {
  const { isLoading, isAuthenticated, logout } = useAuthentication()
  const router = useRouter()

   useEffect(() => {
    if(!isAuthenticated && !isLoading) {
      router.push('/auth')
      return
    }

    if(isAuthenticated) {
      router.push('/portal')
      return
    }
  }, [isAuthenticated, isLoading])

  return <Loader />
}
export default Page