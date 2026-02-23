"use client"

import { ApiError, AuthService } from "@edgeos/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { z } from "zod/v4"
import { ButtonAnimated } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { queryKeys } from "@/lib/query-keys"
import { useTenant } from "@/providers/tenantProvider"

const emailSchema = z.email("Please enter a valid email address")
const codeSchema = z
  .string()
  .length(6, "Code must be 6 digits")
  .regex(/^\d{6}$/)

export default function AuthForm() {
  const { tenantId } = useTenant()
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useSearchParams()
  const popupSlug = params.get("popup")

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"email" | "code">("email")
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startCountdown = () => {
    setCountdown(60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const requestCodeMutation = useMutation({
    mutationFn: (data: { tenant_id: string; email: string }) =>
      AuthService.humanLogin({ requestBody: data }),
    onSuccess: () => {
      setStep("code")
      setCode("")
      startCountdown()
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to send verification code")
      } else {
        setError("Something went wrong. Please try again.")
      }
    },
  })

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: {
      email: string
      tenant_id: string
      code: string
    }) => {
      const result = await AuthService.humanAuthenticate({ requestBody: data })
      localStorage.setItem("token", result.access_token)
      return result
    },
    onSuccess: () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.current })
      router.push(`/portal${popupSlug ? `/${popupSlug}` : ""}`)
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Invalid verification code. Please try again.")
        } else if (err.status === 404) {
          setError("Code expired. Please request a new one.")
        } else {
          setError("Failed to verify code. Please try again.")
        }
      } else {
        setError("Network error. Please check your connection.")
      }
    },
  })

  const handleSendCode = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!tenantId) return

    const result = emailSchema.safeParse(email)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setError("")
    requestCodeMutation.mutate({
      tenant_id: tenantId,
      email: email.toLowerCase(),
    })
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) return

    const result = codeSchema.safeParse(code)
    if (!result.success) return

    setError("")
    verifyCodeMutation.mutate({
      email: email.toLowerCase(),
      tenant_id: tenantId,
      code,
    })
  }

  const handleResend = () => {
    setCode("")
    setError("")
    handleSendCode()
  }

  const handleChangeEmail = () => {
    setStep("email")
    setCode("")
    setError("")
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setCountdown(0)
  }

  const isLoading =
    requestCodeMutation.isPending || verifyCodeMutation.isPending

  const animationFade = {
    initial: { opacity: 0, y: 0 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex flex-col justify-center w-full md:w-1/2 p-4">
      <div className="max-w-md w-full mx-auto space-y-8 md:my-12">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 16, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeIn",
          }}
          className="relative aspect-square w-[180px] mx-auto mb-8"
        >
          <img
            src="https://simplefi.s3.us-east-2.amazonaws.com/edge_island.png"
            alt="EdgeCity illustration"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "0.5rem",
            }}
          />
        </motion.div>
        <motion.div
          initial="initial"
          animate="animate"
          variants={animationFade}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center max-w-md mx-auto mb-4">
            <h2
              className="mt-6 text-3xl font-bold text-gray-900"
              style={{ textWrap: "balance" }}
            >
              {step === "email"
                ? "Sign Up or Log In"
                : "Enter verification code"}
            </h2>
            <p
              className="mt-2 text-sm text-gray-600"
              style={{ textWrap: "balance" }}
            >
              {step === "email"
                ? "Welcome! Enter your email to receive a verification code."
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {step === "email" ? (
            <form
              className="mt-4 space-y-6 max-w-xs mx-auto"
              onSubmit={handleSendCode}
            >
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
                    setError("")
                  }}
                  disabled={isLoading}
                  className="appearance-none rounded-md relative block w-full px-3 py-5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                />
              </div>
              <ButtonAnimated
                type="submit"
                disabled={isLoading || !email}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  "Continue"
                )}
              </ButtonAnimated>
            </form>
          ) : (
            <form
              className="mt-4 space-y-6 max-w-xs mx-auto"
              onSubmit={handleVerifyCode}
            >
              <div>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setCode(val)
                    setError("")
                  }}
                  disabled={isLoading}
                  autoFocus
                  className="appearance-none rounded-md relative block w-full px-3 py-5 border border-gray-300 placeholder-gray-500 text-gray-900 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10"
                />
              </div>
              <ButtonAnimated
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  "Verify"
                )}
              </ButtonAnimated>
              <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                {countdown > 0 ? (
                  <p>Resend code in {countdown}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-black underline hover:text-gray-700 disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
      {error && (
        <div className="mt-6 max-w-md mx-auto mb-4 p-4 bg-red-100 border-l-4 border-red-500 rounded-md animate-fade-in-down">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
