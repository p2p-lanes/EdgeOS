import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { 
  error?: string,
  variant?: "outlined" | "standard" 
}>(
  ({ className, type, error, variant = "outlined", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full bg-transparent px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          variant === "outlined" && " shadow-sm rounded-md border border-input focus-visible:ring-1 focus-visible:ring-ring",
          variant === "standard" && "border-b focus-visible:border-b-2 focus-visible:border-gray-400",
          !!error && "border-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
