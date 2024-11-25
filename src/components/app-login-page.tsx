'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export async function generateOTP(email: string) {
  // In a real application, this would generate and send an OTP
  return {
    success: true,
    message: "OTP generated successfully",
    otp: "1"
  }
}

export async function verifyOTP(email: string, otp: string) {
  // In a real application, this would verify the OTP against stored value
  return {
    success: true,
    message: "OTP verified successfully"
  }
}


export function BlockPage() {
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'otp'
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await generateOTP(email)
      if (result.success) {
        setStep('otp')
        setOTP('') // Clear the OTP when moving to the OTP step
        setMessage('') // Clear any existing error messages
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Error generating OTP. Please try again.')
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await verifyOTP(email, otp)
      if (result.success) {
        router.push('/dashboard') // Redirect to dashboard on successful login
      } else {
        setMessage('Invalid OTP. Please try again.')
      }
    } catch (error) {
      setMessage('Error verifying OTP. Please try again.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 'email' ? handleEmailSubmit : handleOTPSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={step === 'otp'}
                />
              </div>
              <AnimatePresence>
                {step === 'otp' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col space-y-1.5"
                  >
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input 
                      id="otp" 
                      type="text" 
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOTP(e.target.value)}
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <CardFooter className="flex justify-between mt-4 px-0">
              {step === 'otp' && (
                <Button type="button" variant="outline" onClick={() => {
                  setStep('email')
                  setOTP('')
                  setMessage('')
                }}>
                  Back
                </Button>
              )}
              <Button type="submit">
                {step === 'email' ? 'Request OTP' : 'Verify OTP'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      {message && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {message}
        </div>
      )}
    </div>
  )
}