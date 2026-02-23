import type * as React from "react"

import { cn } from "@/lib/utils"

function HeroInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="hero-input"
      className={cn(
        "w-full border-0 bg-transparent text-3xl font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0",
        className,
      )}
      {...props}
    />
  )
}

function InlineSection({
  title,
  children,
  className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div data-slot="inline-section" className={cn("space-y-1", className)}>
      {title && (
        <h3 className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="divide-y divide-border">{children}</div>
    </div>
  )
}

function InlineRow({
  icon,
  label,
  description,
  children,
  className,
}: {
  icon?: React.ReactNode
  label: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="inline-row"
      className={cn(
        "flex items-center justify-between gap-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export { HeroInput, InlineSection, InlineRow }
