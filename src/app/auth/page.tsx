'use client'

import Quote from '@/app/auth/Quote'
import { Loader } from '@/components/ui/Loader'
import useAuthentication from '@/hooks/useAuthentication'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'

// Dynamically import AuthForm with no SSR
const AuthForm = dynamic(() => import('@/app/auth/AuthForm'), {
  ssr: false,
})

export default function AuthPage() {
  const { login, token, isLoading, isAuthenticated, user } = useAuthentication()
  const router = useRouter()
  const params = useSearchParams()
  const popupSlug = params.get('popup')

  const handleLogin = async () => {
    const isLogged = await login()
    if(isLogged) {
      router.push(`/portal${popupSlug ? `/${popupSlug}` : ''}`)
    }
  }

  useEffect(() => {
    if(isAuthenticated && !isLoading) {
      router.push('/portal')
      return
    }
    
    handleLogin()

  }, [isAuthenticated])

  if(isLoading || isAuthenticated || token) {
    return (
      <div className="w-full h-full">
        <Loader/>
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

