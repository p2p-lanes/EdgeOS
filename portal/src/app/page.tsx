"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader } from "@/components/ui/Loader"
import { isLoggedIn } from "@/hooks/useAuth"

const Page = () => {
  const router = useRouter()
  const loggedIn = isLoggedIn()

  useEffect(() => {
    router.push(loggedIn ? "/portal" : "/auth")
  }, [loggedIn, router])

  return <Loader />
}
export default Page
