'use client'

import AuthForm from '@/app/auth/AuthForm'
import Quote from '@/app/auth/Quote'
import { Loader } from '@/components/ui/Loader'
import useAuthentication from '@/hooks/useAuthentication'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthPage() {
  const { login, token } = useAuthentication()
  const router = useRouter()

  useEffect(() => {
    if (login()) {
      router.push('/portal')
    }
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

