'use client'

import Quote from '@/app/auth/Quote'
import { Loader } from '@/components/ui/Loader'
import useAuthentication from '@/hooks/useAuthentication'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import AuthForm with no SSR
const AuthForm = dynamic(() => import('@/app/auth/AuthForm'), {
  ssr: false,
})

export default function AuthPage() {
  const { login, token } = useAuthentication()
  const router = useRouter()

  const handleLogin = async () => {
    if(await login()) {
      router.push('/portal')
    }
  }

  useEffect(() => {
    handleLogin()
  }, [])

  if(token) {
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

