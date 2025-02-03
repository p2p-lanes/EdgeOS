import * as React from "react"

import { cn } from "@/lib/utils"

const inputVariants = {
  base: "flex h-9 w-full bg-transparent px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  outlined: {
    default: "shadow-sm rounded-md border border-input focus-visible:ring-1 focus-visible:ring-ring",
    disabled: "bg-gray-100 border-gray-400",
    error: "border-red-500"
  },
  standard: {
    default: "border-b focus-visible:border-b-2 focus-visible:border-gray-400",
    disabled: "",
    error: "border-red-500"
  }
} as const

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { 
  error?: string,
  variant?: "outlined" | "standard" 
}>(
  ({ className, type, error, variant = "outlined", disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants.base,
          inputVariants[variant].default,
          disabled && inputVariants[variant].disabled,
          error && inputVariants[variant].error,
          className
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
