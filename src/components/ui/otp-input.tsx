"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface OtpInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
}

const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  ({ className, length = 6, value, onChange, disabled = false, error, ...props }, ref) => {
    const [activeInput, setActiveInput] = React.useState(0)
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

    const getOTPValue = () => (value ? value.toString().split("") : [])

    const focusInput = (inputIndex: number) => {
      const selectedIndex = Math.max(Math.min(length - 1, inputIndex), 0)
      inputRefs.current[selectedIndex]?.focus()
      setActiveInput(selectedIndex)
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const val = e.target.value
      if (!/^[0-9]$/.test(val) && val !== "") return

      const newValue = value.split("")
      newValue[index] = val
      onChange(newValue.join(""))

      if (val && index < length - 1) {
        focusInput(index + 1)
      }
    }

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      const key = e.key

      if (key === "Backspace") {
        e.preventDefault()
        if (value[index]) {
          const newValue = value.split("")
          newValue[index] = ""
          onChange(newValue.join(""))
        } else if (index > 0) {
          focusInput(index - 1)
          const newValue = value.split("")
          newValue[index - 1] = ""
          onChange(newValue.join(""))
        }
      } else if (key === "ArrowLeft") {
        e.preventDefault()
        focusInput(index - 1)
      } else if (key === "ArrowRight") {
        e.preventDefault()
        focusInput(index + 1)
      } else if (key === "Delete") {
        e.preventDefault()
        const newValue = value.split("")
        newValue[index] = ""
        onChange(newValue.join(""))
      } else if (key === "Spacebar" || key === " ") {
        e.preventDefault()
      }
    }

    const handleOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedText = e.clipboardData.getData("text/plain").trim()
      
      if (!/^\d+$/.test(pastedText)) return

      const otpValue = pastedText.slice(0, length).split("")
      onChange(otpValue.join(""))
      
      if (otpValue.length === length) {
        inputRefs.current[length - 1]?.focus()
        setActiveInput(length - 1)
      } else {
        focusInput(otpValue.length)
      }
    }

    const handleOnFocus = (index: number) => {
      setActiveInput(index)
    }

    React.useEffect(() => {
      inputRefs.current = inputRefs.current.slice(0, length)
      focusInput(0)
    }, [length])

    const renderInputs = () => {
      const otp = getOTPValue()
      const inputs = []

      for (let i = 0; i < length; i++) {
        inputs.push(
          <div
            key={i}
            className="w-10 h-12"
          >
            <input
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{1}"
              maxLength={1}
              className={cn(
                "w-full h-full text-center text-base md:text-lg font-medium rounded-md border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all",
                error ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-ring",
                disabled ? "bg-muted cursor-not-allowed opacity-50" : "bg-background",
                className
              )}
              value={otp[i] || ""}
              onChange={(e) => handleOnChange(e, i)}
              onKeyDown={(e) => handleOnKeyDown(e, i)}
              onPaste={handleOnPaste}
              onFocus={() => handleOnFocus(i)}
              disabled={disabled}
              aria-label={`Digit ${i + 1} of verification code`}
            />
          </div>
        )
      }

      return inputs
    }

    return (
      <div 
        ref={ref} 
        className={cn("flex gap-2 justify-center", className)} 
        {...props}
      >
        {renderInputs()}
      </div>
    )
  }
)
OtpInput.displayName = "OtpInput"

export { OtpInput } 