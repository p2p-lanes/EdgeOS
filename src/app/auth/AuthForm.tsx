'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/api'

export default function AuthForm() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isValidEmail, setIsValidEmail] = useState(true)

  if (!isMounted) {
    return null
  }

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setIsValidEmail(false)
      return
    }
    setIsValidEmail(true)
    setIsLoading(true)
    
    api.post(`citizens/authenticate`, {email}).then(() => {
      setIsLoading(false)
      setMessage('Check your email inbox for the log in link')
    })
  }

  return (
    <div className="flex flex-col justify-center w-full md:w-1/2 p-8">
      <div className="max-w-sm w-full mx-auto space-y-8 my-12">
        <div className="relative aspect-square w-24 mx-auto mb-8">
          <img
            src="https://sjc.microlink.io/W16KL5ygz5qRkKvnitli2zGNAZQlZEye8Vcq7r1fYLzdHRsyrS2H49OQ9VMfHiCJsYlxM53pi6Zkuw9QOfgvDQ.jpeg"
            alt="EdgeCity illustration"
            style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem'}}
          />
        </div>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign into the Edge Esmeralda portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email below and receive a link to log into the portal
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="max-w-xs mx-auto">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setIsValidEmail(true)
                setMessage('')
              }}
              disabled={isLoading || !!message}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                isValidEmail ? 'border-gray-300' : 'border-red-500'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
            />
            {!isValidEmail && (
              <p className="mt-2 text-sm text-red-600">Please enter a valid email address</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !!message || !email}
            className="group relative w-full max-w-xs mx-auto flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Log in'}
          </Button>
        </form>
        {message && (
          <div className="mt-8 p-4 bg-green-100 border-l-4 border-green-500 rounded-md animate-fade-in-down">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

