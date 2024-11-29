'use client'

import AuthForm from '@/app/auth/AuthForm'
import Quote from '@/app/auth/Quote'

export default function AuthPage() {
  return (
    <div className="flex min-h-screen">
      <Quote />
      <AuthForm />
    </div>
  )
}

