import { ApiError, AuthService } from "@edgeos/api-client"
import { useCallback, useEffect, useRef, useState } from "react"
import { configureApiClient } from "@/lib/api-client"
import { useTenant } from "@/providers/tenantProvider"

interface UseEmailVerificationProps {
  email: string
  onVerificationSuccess: (token: string) => void
}

export const useEmailVerification = ({
  email,
  onVerificationSuccess,
}: UseEmailVerificationProps) => {
  const { tenantId } = useTenant()
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  )
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startCountdown = () => {
    setCountdown(60)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendVerificationCode = async () => {
    if (!email) {
      setVerificationError("Email is required")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setVerificationError("Invalid email")
      return
    }

    try {
      setIsSendingCode(true)
      setVerificationError(null)

      await AuthService.humanLogin({
        requestBody: {
          tenant_id: tenantId ?? "",
          email: email.toLowerCase(),
        },
      })

      setShowVerificationInput(true)
      startCountdown()
    } catch (error) {
      console.error("Error sending verification code:", error)
      setVerificationError(
        "Failed to send verification code. Please try again.",
      )
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleVerifyCode = useCallback(async () => {
    if (verificationCode.length !== 6) {
      setVerificationError("Please enter the full 6-digit code")
      return
    }

    try {
      setIsVerifyingCode(true)
      setVerificationError(null)

      const result = await AuthService.humanAuthenticate({
        requestBody: {
          email: email.toLowerCase(),
          tenant_id: tenantId ?? "",
          code: verificationCode,
        },
      })

      const token = result.access_token
      configureApiClient(token)
      window?.localStorage?.setItem("token", token)

      setVerificationError(null)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setCountdown(0)
      setShowVerificationInput(false)

      onVerificationSuccess(token)
    } catch (error: unknown) {
      console.error("Error verifying code:", error)

      if (error instanceof ApiError) {
        if (error.status === 401) {
          setVerificationError("Invalid verification code. Please try again.")
        } else if (error.status === 404) {
          setVerificationError(
            "Verification code not found. Please request a new code.",
          )
        } else {
          setVerificationError("Failed to verify code. Please try again.")
        }
      } else {
        setVerificationError(
          "Network error. Please check your connection and try again.",
        )
      }
    } finally {
      setIsVerifyingCode(false)
    }
  }, [email, verificationCode, onVerificationSuccess, tenantId])

  useEffect(() => {
    if (
      verificationCode.length === 6 &&
      showVerificationInput &&
      !isVerifyingCode
    ) {
      handleVerifyCode()
    }
  }, [
    verificationCode,
    handleVerifyCode,
    isVerifyingCode,
    showVerificationInput,
  ])

  const handleResendCode = async () => {
    try {
      setVerificationCode("")
      setVerificationError(null)
      await handleSendVerificationCode()
    } catch (error) {
      console.error("Error resending code:", error)
      setVerificationError(
        "Failed to resend verification code. Please try again.",
      )
    }
  }

  const handleChangeEmail = () => {
    setShowVerificationInput(false)
    setVerificationCode("")
    setVerificationError(null)

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setCountdown(0)
  }

  return {
    showVerificationInput,
    verificationCode,
    setVerificationCode,
    isSendingCode,
    isVerifyingCode,
    verificationError,
    countdown,
    handleSendVerificationCode,
    handleVerifyCode,
    handleResendCode,
    handleChangeEmail,
  }
}
