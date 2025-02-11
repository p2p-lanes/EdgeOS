import { ProductsPass } from "@/types/Products"
import { Plus, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/helpers/dates"

type VariantStyles = 'selected' | 'purchased' | 'edit' | 'disabled' | 'default'

const variants: Record<VariantStyles, string> = {
  selected: 'bg-green-300 border-green-400 text-green-800 hover:bg-green-300/80',
  purchased: 'bg-slate-800 text-white border-neutral-700',
  edit: 'bg-white border-dashed border-neutral-200 text-neutral-700',
  disabled: 'bg-neutral-200 text-neutral-400 cursor-not-allowed',
  default: 'bg-white border-neutral-300 text-neutral-700 hover:bg-slate-100',
}

const ProductTicket = ({product, onClick}: {product: ProductsPass, onClick: () => void}) => {
  const originalPrice = product.compare_price ?? product.price

  return (
    <button 
      onClick={product.disabled || product.purchased ? undefined : onClick}
      disabled={product.disabled || product.purchased}
      className={cn(
        'flex items-center gap-2 border border-neutral-200 rounded-md p-2',
        variants[product.selected ? 'selected' : product.purchased ? 'purchased' : product.disabled ? 'disabled' : product.edit ? 'edit' : 'default']
      )}
    >
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-2">
          {
            !product.selected && !product.purchased && (
              <Plus className="w-4 h-4" />
            )
          }
          <Ticket className="w-4 h-4" />
          <p className="font-semibold text-sm">{product.name}</p>

          {
            product.start_date && product.end_date && (
              <span className={`text-xs text-muted-foreground ${product.purchased ? 'text-white' : ''}`}>
                {formatDate(product.start_date, {day: 'numeric', month: 'short'})} to {formatDate(product.end_date, {day: 'numeric', month: 'short'})}
              </span>
            )
          }
        </div>

      {
        !product.purchased && (
          <div className="flex items-center gap-2">
            {
              originalPrice !== product.price && (
                <p className="text-xs text-muted-foreground line-through">
                  ${originalPrice.toLocaleString()}
                </p>
              )
            }
            <p className="text-md font-medium">$ {product.price.toLocaleString()}</p>
          </div>
        )
      }
      </div>
    </button>
  )
}

export default ProductTicket