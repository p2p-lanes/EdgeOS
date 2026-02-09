import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ProductsPass } from "@/types/Products";
import { Check, Crown, Info, Plus } from 'lucide-react'
import { cn } from "@/lib/utils";
import { isVariablePrice, getEffectivePrice } from "@/helpers/variablePrice";
import VariablePriceInput from "./VariablePriceInput";

// HOC para manejar la lógica de presentación
const withSpecialProductPresentation = (WrappedComponent: React.ComponentType<any>) => {
  return function WithSpecialProductPresentation(props: SpecialProps) {
    const { selected, disabled, purchased } = props.product;
    
    const getStatusIcon = () => {
      if (disabled || purchased || props.disabled) {
        return null;
      }
      if (selected) {
        return <Check className="w-4 h-4" color="#005F3A"/>;
      }
      return <Plus className="w-4 h-4" />;
    };

    return <WrappedComponent {...props} getStatusIcon={getStatusIcon} />;
  };
};

interface ProductTitleProps {
  product: ProductsPass;
  selected: boolean;
  disabled: boolean;
}

const ProductTitle = ({ product, selected, disabled }: ProductTitleProps) => (
  <span className={cn(
    "font-semibold flex items-center gap-2",
    selected && "text-[#005F3A]",
    disabled && "text-neutral-300"
  )}>
    <Crown className={cn("w-5 h-5 text-orange-500", disabled && "text-neutral-300")} />
    {product.name}
    {
      !disabled && (
        <TooltipPatreon purchased={product.purchased}/>
      )
    }
  </span>
);

interface ProductPriceProps {
  product: ProductsPass;
  selected: boolean;
  disabled: boolean;
  isVariable: boolean;
}

const ProductPrice = ({ product, selected, disabled, isVariable }: ProductPriceProps) => {
  // For variable price products, show the effective price (custom_amount or suggested)
  const displayPrice = isVariable ? getEffectivePrice(product) : product.price;
  
  return (
    <span className={cn(
      "font-medium",
      selected && "text-[#005F3A]",
      disabled && "text-neutral-300"
    )}>
      ${displayPrice.toLocaleString()}
    </span>
  );
};

const TooltipPatreon = ({ purchased }: { purchased?: boolean }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="cursor-pointer">
        <Info className={cn("w-4 h-4 text-neutral-400", purchased && "text-white")} />
      </div>
    </TooltipTrigger>
    <TooltipContent className="bg-white text-black max-w-[420px] border border-gray-200">
      ⁠A patron pass gives you access to the whole month and supports scholarships 
      for researchers, artists and young builders. Edge Institute is a certified 
      501c3 and you will receive a written acknowledgement from us for your records.
    </TooltipContent>
  </Tooltip>
);

// Interfaces
interface SpecialProps {
  product: ProductsPass;
  onClick?: () => void;
  onCustomAmountChange?: (amount: number | undefined) => void;
  disabled?: boolean;
}

type VariantStyles = 'selected' | 'purchased' | 'edit' | 'disabled' | 'default'

const variants: Record<VariantStyles, string> = {
  selected: 'bg-gradient-to-r from-[#FF7B7B]/30 to-[#E040FB]/30 border-neutral-300',
  purchased: 'bg-slate-800 text-white border-neutral-700 cursor-not-allowed',
  edit: 'bg-slate-800/30 border-dashed border-slate-200 text-neutral-700',
  disabled: 'bg-neutral-0 text-neutral-300 cursor-not-allowed ',
  default: 'bg-white border-neutral-300 text-neutral-700 hover:bg-gradient-to-r hover:from-[#FF7B7B]/10 hover:to-[#E040FB]/10',
}

// Componente base
function SpecialBase({ 
  product, 
  onClick,
  onCustomAmountChange,
  getStatusIcon,
  disabled
}: SpecialProps & { getStatusIcon: () => JSX.Element | null, disabled?: boolean }) {

  const { selected, disabled: productDisabled, purchased } = product;
  const isVariable = isVariablePrice(product);

  const isDisabled = disabled || productDisabled;
  const hasOnClick = !isDisabled && onClick && !purchased;

  const handleClick = () => {
    if (!hasOnClick) return;
    // toggleProduct in the provider handles injecting custom_amount for variable-price products
    onClick?.();
  };

  const handleCustomAmountChange = (amount: number | undefined) => {
    onCustomAmountChange?.(amount);
  };

  // Stop propagation to prevent triggering parent click when interacting with input
  const handleInputContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="w-full">
      <button
        data-category="patreon"
        onClick={handleClick}
        data-selected={selected}
        data-price={isVariable ? getEffectivePrice(product) : product.price}
        className={cn(
          'w-full py-1 px-4 flex items-center justify-between gap-2 border border-neutral-200 rounded-md',
          variants[purchased ? 'purchased' : isDisabled || !onClick ? 'disabled' : selected ? 'selected' : 'default']
        )}
      >
        <div className="flex items-center gap-2 py-2">
          {getStatusIcon()}
          <ProductTitle product={product} disabled={isDisabled || !onClick} selected={selected ?? false} />
        </div>
        
        <div className="flex items-center gap-4">
          {
            product.purchased ? (
              <span className="text-sm font-medium text-[white]">
                Purchased
              </span>
            ) : (
              <ProductPrice 
                product={product} 
                selected={selected ?? false} 
                disabled={isDisabled || !onClick}
                isVariable={isVariable}
              />
            )
          }
        </div>
      </button>

      {/* Variable Price Input - shown when product is variable price and selected */}
      {isVariable && selected && !purchased && (
        <div 
          className="mt-2 px-4"
          onClick={handleInputContainerClick}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <VariablePriceInput
            product={product}
            value={product.custom_amount}
            onChange={handleCustomAmountChange}
            disabled={isDisabled}
          />
        </div>
      )}
    </div>
  );
}

// Exportar el componente envuelto con el HOC
export default withSpecialProductPresentation(SpecialBase);
