"use client"

import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { Loader } from "@/components/ui/Loader"
import useAuth from "@/hooks/useAuth"

const Authentication = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useAuth()

  if (isUserLoading) return <Loader />
  if (!user) redirect("/auth")

  return children
}

export default Authentication
