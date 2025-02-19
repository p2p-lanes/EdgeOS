import { ProductsPass } from "@/types/Products"
import { Plus, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/helpers/dates"
import { usePassesProvider } from "@/providers/passesProvider"

type VariantStyles = 'selected' | 'purchased' | 'edit' | 'disabled' | 'default'

const variants: Record<VariantStyles, string> = {
  selected: 'bg-green-200 border-green-400 text-green-800 hover:bg-green-200/80',
  purchased: 'bg-slate-800 text-white border-neutral-700',
  edit: 'bg-slate-800/30 border-dashed border-slate-200 text-neutral-700',
  disabled: 'bg-neutral-0 text-neutral-300 cursor-not-allowed ',
  default: 'bg-white border-neutral-300 text-neutral-700 hover:bg-slate-100',
}

const Product = ({product, onClick, defaultDisabled}: {product: ProductsPass, onClick: () => void, defaultDisabled?: boolean}) => {
  const disabled = product.disabled || defaultDisabled
  const originalPrice = product.compare_price ?? product.price
  const { edit, purchased, selected } = product
  const { isEditing } = usePassesProvider()

  return (
    <button 
      onClick={disabled || (purchased && !isEditing) ? undefined : onClick}
      disabled={disabled || (purchased && !isEditing)}
      className={cn(
        'flex items-center gap-2 border border-neutral-200 rounded-md p-2',
        variants[(selected && purchased) ? 'edit' : disabled ? 'disabled' : selected ? 'selected' : purchased ? 'purchased' : 'default']
      )}
    >
      <div className="flex justify-between w-full">
        <div className="flex md:items-center md:gap-2 flex-col md:flex-row">
          <div className="flex items-center gap-2">
            {
              !product.selected && !product.purchased && (
                <Plus className="w-4 h-4" />
              )
            }
            <Ticket className="w-4 h-4" />
            <p className="font-semibold text-sm">{product.name}</p>
          </div>

          {
            product.start_date && product.end_date && (
              <span className={cn(`text-xs text-muted-foreground ${product.purchased ? 'text-white' : ''}`, disabled && 'text-neutral-300')}>
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
                <p className={cn("text-xs text-muted-foreground line-through", disabled && 'text-neutral-300')}>
                  ${originalPrice.toLocaleString()}
                </p>
              )
            }
            <p className={cn("text-md font-medium", disabled && 'text-neutral-300')}>$ {product.price.toLocaleString()}</p>
          </div>
        )
      }
      </div>
    </button>
  )
}

export default Product