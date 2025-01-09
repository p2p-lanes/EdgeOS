'use client'

import { Check, Plus, LucideIcon, Ban } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ProductsPass } from '@/types/Products';
import { TicketCategoryProps } from '@/types/Application';

interface TicketsBadgeProps {
  product: ProductsPass;
  iconTitle: LucideIcon
  selected?: boolean
  disabled: boolean;
  purchased?: boolean;
  onClick?: () => void
}

export function TicketsBadge({
  product,
  disabled,
  iconTitle: IconTitle,
  selected = false,
  purchased = false,
  onClick,
}: TicketsBadgeProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={cn(
        "flex items-center justify-between w-full px-3 py-1 transition-colors rounded-full",
        "border border-gray-200 hover:bg-gray-100",
        disabled && "bg-gray-200 hover:bg-gray-200 text-gray-600 cursor-default border-gray-300",
        selected && "bg-[#D5F7CC] hover:bg-[#D5F7CC] text-[#005F3A] border-[#16a34a]",
        purchased && "bg-[#D5F7CC] hover:bg-[#D5F7CC] text-[#005F3A] border-[transparent]",
        product.exclusive && "sm:col-span-2 3xl:col-span-3"
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
            <span className="font-medium text-sm">{product.name}</span>
          </div>
          {
            product.start_date && product.end_date && (
              <span className={cn(
                "text-xs",
                selected ? "text-[#005F3A]" : "text-gray-500"
              )}>{new Date(product.start_date ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' '} to {new Date(product.end_date ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )
          }
        </div>
      </div>
      {
        purchased ? (
          <Check className="w-4 h-4" />
        ) : (
          disabled ? (
            <Ban className="w-4 h-4" />
          ): (
          <span className={cn("font-medium text-sm", selected ? "text-[#005F3A]" : "text-gray-600")}>
            ${product.price.toLocaleString()}
          </span>
        )
      )}
    </button>
  )
}
