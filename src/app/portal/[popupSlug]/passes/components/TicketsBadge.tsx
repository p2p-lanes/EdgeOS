'use client'

import { Check, Plus, LucideIcon, Ban } from 'lucide-react'
import { cn } from "@/lib/utils"

interface TicketsBadgeProps {
  title: string
  subtitle: string
  price: number
  iconTitle: LucideIcon
  selected?: boolean
  disabled: boolean;
  onClick?: () => void
}

export function TicketsBadge({
  title,
  subtitle,
  price,
  disabled,
  iconTitle: IconTitle,
  selected = false,
  onClick
}: TicketsBadgeProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={cn(
        "flex items-center justify-between w-auto min-w-[170px] px-3 py-1 transition-colors rounded-full",
        "border border-gray-200 hover:bg-gray-100",
        disabled && "bg-[#878b94] hover:bg-[#878b94] text-white cursor-default",
        selected && "bg-[#16a34a] hover:bg-[#16a34a] text-white border-[#16a34a]"
      )}
    >
      <div className="flex items-center">
        <div className="flex items-center w-6 h-6">
          {selected && !disabled ? (
            <Check className="w-4 h-4" />
          ) : !disabled ? (
            <Plus className="w-4 h-4" />
          ) : null}
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <IconTitle className="w-4 h-4" />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <span className={cn(
            "text-xs",
            selected || disabled ? "text-white" : "text-gray-500"
          )}>{subtitle}</span>
        </div>
      </div>
      {
        disabled ? <Ban className='w-4 h-4'/> : (
          <span className="font-medium text-sm">
            ${price.toLocaleString()}
          </span>
        )
      }
    </button>
  )
}

