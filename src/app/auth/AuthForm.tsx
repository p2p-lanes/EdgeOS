'use client'

import { useState, useEffect } from 'react'
import { Button, ButtonAnimated } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/api'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { config } from '@/constants/config'
import useSignInWorldApp from '@/hooks/useSignInWorldApp'
import Image from 'next/image'
import DrawerEmailWorldID from './DrawerEmailWorldID'
import { MiniKit } from '@worldcoin/minikit-js'

export default function AuthForm() {
  const [isMounted, setIsMounted] = useState(false)
  const params = useSearchParams()
  const popupSlug = params.get('popup')
  const { signIn } = useSignInWorldApp()
  const [open, setOpen] = useState(false)
  const [worldData, setWorldData] = useState<{signature: string | null, address: string | null}>({signature: null, address: null})

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({status: '', message: ''})
  const [isValidEmail, setIsValidEmail] = useState(true)

  if (!isMounted) {
    return null
  }

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  const handleSignInWorldID = async () => {
    const result = await signIn()
    if(result.status === 'success') {
      setOpen(true)
      setWorldData({signature: result.signature ?? null, address: result.address ?? null})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setIsValidEmail(false)
      return
    }
    setIsValidEmail(true)
    setIsLoading(true)
    
    api.post(`citizens/authenticate`, {email: email, popup_slug: popupSlug ?? null, world_redirect: MiniKit.isInstalled(), signature: worldData.signature, world_address: worldData.address}).then((e) => {
      if(e.status === 200) {
        setOpen(false)
        setIsLoading(false)
        setMessage({status: 'success', message: 'Check your email inbox for the log in link'})
      } else {
        setOpen(false)
        setIsLoading(false)
        setMessage({status: 'error', message: 'Something went wrong, please try again later'})
      }
    })
  }

  const animationFade = {
    initial: { opacity: 0, y: 0 },
    animate: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex flex-col justify-center w-full md:w-1/2 p-4">
      <div className="max-w-md w-full mx-auto space-y-8 md:my-12">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'loop', ease: 'easeIn' }}
          className="relative aspect-square w-[180px] mx-auto mb-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://simplefi.s3.us-east-2.amazonaws.com/edge-patagonia-island-min.png"
            alt="EdgeCity illustration"
            style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem'}}
          />
        </motion.div>
        <motion.div
          initial="initial"
          animate="animate"
          variants={animationFade}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center max-w-md mx-auto mb-4">
            <h2 className="mt-6 text-3xl font-bold text-gray-900" style={{ textWrap: 'balance' }}>
              Sign Up or Log In to {config.name}
            </h2>
            <p className="mt-2 text-sm text-gray-600" style={{ textWrap: 'balance' }}>
            Welcome! If it’s your first time, sign up below. If you attended a past event, use the same email to import your prior application.
            </p>
          </div>

          <DrawerEmailWorldID open={open} setOpen={setOpen} handleCancel={() => setOpen(false)} handleSubmit={handleSubmit} isLoading={isLoading} email={email} setEmail={setEmail} />
          <form className="mt-4 space-y-6 max-w-xs mx-auto" onSubmit={handleSubmit}>
            <div>
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
                  setMessage({status: '', message: ''})
                }}
                disabled={isLoading || !!message.message}
                className={`appearance-none rounded-md relative block w-full px-3 py-5 border ${
                  isValidEmail ? 'border-gray-300' : 'border-red-500'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
              />
              {!isValidEmail && (
                <p className="mt-2 text-sm text-red-600">Please enter a valid email address</p>
              )}
            </div>
            <ButtonAnimated
              type="submit"
              disabled={isLoading || message.status === 'success' || !email}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Continue'}
            </ButtonAnimated>
            <p className="mt-2 text-sm text-gray-600" style={{ textAlign: 'center', textWrap: 'balance' }}>
            You&apos;ll receive a magic link in your email inbox to log in.
            </p>
          </form>
        </motion.div>
      </div>
        {message.message !== '' && (
          <div className={`mt-6 max-w-md mx-auto mb-4 p-4 bg-${message.status === 'success' ? 'green' : 'red'}-100 border-l-4 border-${message.status === 'success' ? 'green' : 'red'}-500 rounded-md animate-fade-in-down`}>
            <div className="flex">
              {message.status === 'success' && (
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${message.status === 'success' ? 'text-green-400' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="ml-3">
                <p className={`text-sm ${message.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {message.message}
                </p>
                  </div>
            </div>
          </div>
        )}
    </div>
  )
}

