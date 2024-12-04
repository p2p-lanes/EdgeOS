import * as React from "react"
import { cn } from "@/lib/utils"

export interface AddonInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  addon?: string
  className?: string
  containerClassName?: string
}

const AddonInput = React.forwardRef<HTMLInputElement, AddonInputProps>(
  ({ className, addon, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("flex w-full items-center", containerClassName)}>
        {addon && (
          <span className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
            {addon}
          </span>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            addon && "rounded-l-none",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
AddonInput.displayName = "AddonInput"

export { AddonInput }

