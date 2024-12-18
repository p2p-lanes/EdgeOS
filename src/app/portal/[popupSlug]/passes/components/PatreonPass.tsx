import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductsProps } from "@/types/Products"
import { Gem } from 'lucide-react'
import type { LucideIcon } from "lucide-react"

interface PatreonPassProps {
  product: any;
  selected: boolean
  icon: LucideIcon
  onClick: () => void
}

export default function PatreonPass({ product, selected, icon: Icon = Gem, onClick }: PatreonPassProps) {
  return (
    <div 
      className={`
        w-full max-w-md rounded-full flex items-center justify-between py-1 px-4
        transition-all duration-300
        ${selected ? 'border-2 border-[#0F172A]' : 'border-2 border-transparent'}
      `}
      style={{
        background: "linear-gradient(to right, #BBFF2C, #EEFF2C)"
      }}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{product.name}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="font-medium">${product.price.toLocaleString()}</span>
        <Button
          onClick={() => onClick()}
          variant="outline"
          className={`
            rounded-full px-6 transition-colors hover:
            ${selected ? 'bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#0F172A]/90' : ''}
          `}
        >
          {selected ? 'Selected' : 'Select'}
        </Button>
      </div>
    </div>
  )
}

