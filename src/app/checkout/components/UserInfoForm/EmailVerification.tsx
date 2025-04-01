import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import InputForm from "@/components/ui/Form/Input";

interface EmailVerificationProps {
  email: string;
  showVerificationInput: boolean;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  verificationError: string | null;
  countdown: number;
  handleEmailChange: (value: string) => void;
  handleSendCode: () => void;
  handleResendCode: () => void;
  isDisabled: boolean;
  emailError?: string;
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
  isDisabled,
  emailError
}: EmailVerificationProps) => {
  return (
    <div className="space-y-4">
      <InputForm
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        error={emailError}
        isRequired
        placeholder="example@email.com"
        disabled={showVerificationInput && isDisabled}
      />
      
      {showVerificationInput && (
        <div className="space-y-2">
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm text-center">
              We've sent a 6-digit verification code to <span className="font-medium">{email}</span>
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
              <p className="text-sm text-red-500 text-center">{verificationError}</p>
            )}
            <p className="text-xs text-muted-foreground text-center mt-1">
              Didn&apos;t receive the code? Check your spam folder or click &quot;Resend Code&quot; after the timer expires.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerification; 