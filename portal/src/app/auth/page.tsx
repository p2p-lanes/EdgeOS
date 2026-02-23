"use client"

import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import Quote from "@/app/auth/Quote"
import { Loader } from "@/components/ui/Loader"
import { isLoggedIn } from "@/hooks/useAuth"

const AuthForm = dynamic(() => import("@/app/auth/AuthForm"), {
  ssr: false,
})

function AuthContent() {
  const router = useRouter()
  const params = useSearchParams()
  const popupSlug = params.get("popup")
  const loggedIn = isLoggedIn()

  useEffect(() => {
    if (loggedIn) {
      router.push(`/portal${popupSlug ? `/${popupSlug}` : ""}`)
    }
  }, [loggedIn, router, popupSlug])

  if (loggedIn) {
    return (
      <div className="w-full h-full">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Quote />
      <AuthForm />
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full">
          <Loader />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  )
}
