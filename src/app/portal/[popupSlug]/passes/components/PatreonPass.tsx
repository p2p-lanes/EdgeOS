import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductsProps } from "@/types/Products"
import { Check, Gem, Plus } from 'lucide-react'
import type { LucideIcon } from "lucide-react"

interface PatreonPassProps {
  product: any;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void
}

export default function PatreonPass({ product, disabled, selected, onClick }: PatreonPassProps) {
  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={`
        w-full rounded-full flex items-center justify-between py-1 px-4
        transition-all duration-300
        ${selected && 'cursor-pointer'}
        ${selected || disabled ? 'border-2 border-[#16B74A] bg-[#D5F7CC]' : 'cursor-pointer border-2 border-gray-200 bg-transparent hover:bg-gray-100'}
      `}
    >
      <div className="flex items-center gap-2">
        {
          selected || disabled ? (
            <Check className="w-4 h-4" color="#005F3A"/>
          ) : (
            <Plus className="w-4 h-4" />
          )
        }
        <span className={`font-medium ${selected ? 'text-[#005F3A]' : ''}`}>{product.name}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`font-medium ${selected ? 'text-[#005F3A]' : ''}`}>${product.price.toLocaleString()}</span>
      </div>
    </div>
  )
}

