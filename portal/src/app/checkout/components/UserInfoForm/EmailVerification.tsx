import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LabelRequired } from "@/components/ui/label"
import { OtpInput } from "@/components/ui/otp-input"

interface EmailVerificationProps {
  email: string
  showVerificationInput: boolean
  verificationCode: string
  setVerificationCode: (code: string) => void
  verificationError: string | null
  countdown: number
  handleEmailChange: (value: string) => void
  handleSendCode: () => void
  handleResendCode: () => void
  handleChangeEmail: () => void
  isDisabled: boolean
  emailError?: string
}

const EmailVerification = ({
  email,
  showVerificationInput,
  verificationCode,
  setVerificationCode,
  verificationError,
  countdown,
  handleEmailChange,
  handleSendCode,
  handleResendCode,
  handleChangeEmail,
  isDisabled,
  emailError,
}: EmailVerificationProps) => {
  return (
    <div className="space-y-4">
      <div className="w-full flex items-center justify-between">
        <div className="w-full flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <LabelRequired isRequired={true}>Email</LabelRequired>
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            error={emailError}
            required
            placeholder="example@email.com"
            disabled={showVerificationInput}
            className="w-full"
          />
        </div>

        {showVerificationInput && (
          <Button
            type="button"
            variant="link"
            size="default"
            className="mt-[21px]"
            onClick={handleChangeEmail}
          >
            Change email
          </Button>
        )}
      </div>

      {showVerificationInput && (
        <div className="space-y-2">
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm text-center">
              We've sent a 6-digit verification code to{" "}
              <span className="font-medium">{email}</span>
            </p>
            <OtpInput
              value={verificationCode}
              onChange={setVerificationCode}
              error={verificationError || undefined}
            />

            <div className="flex mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={countdown > 0}
                className="text-xs ml-auto"
              >
                {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Code"}
              </Button>
            </div>

            {verificationError && (
              <p className="text-sm text-red-500 text-center">
                {verificationError}
              </p>
            )}
            <p className="text-xs text-muted-foreground text-center mt-1">
              Didn&apos;t receive the code? Check your spam folder or click
              &quot;Resend Code&quot; after the timer expires.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailVerification
