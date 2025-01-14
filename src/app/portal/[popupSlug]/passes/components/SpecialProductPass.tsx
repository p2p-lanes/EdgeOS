import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ProductsPass } from "@/types/Products";
import { Check, Crown, Info, Plus } from 'lucide-react'

interface SpecialProductPassProps {
  product: ProductsPass;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void
}

export default function SpecialProductPass({ product, disabled, selected, onClick }: SpecialProductPassProps) {
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
      <div className="flex items-center gap-2 py-2">
        {
          selected || disabled ? (
            <Check className="w-4 h-4" color="#005F3A"/>
          ) : (
            <Plus className="w-4 h-4" />
          )
        }
        <span className={`font-semibold ${selected ? 'text-[#005F3A]' : ''} flex items-center gap-2`}>
          <Crown className="w-5 h-5 text-orange-500" />
          {product.name}
          <TooltipPatreon/>
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`font-medium ${selected ? 'text-[#005F3A]' : ''}`}>${product.price.toLocaleString()}</span>
      </div>
    </div>
  )
}

const TooltipPatreon = () => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Info className="w-4   h-4 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent className="bg-white text-black max-w-[420px] border border-gray-200">
          ⁠A patron pass gives you access to the whole month and supports scholarships for researchers, artists and young builders.
          Edge Institute is a certified 501c3 and you will receive a written acknowledgement from us for your records.
      </TooltipContent>
    </Tooltip>
  )
}
