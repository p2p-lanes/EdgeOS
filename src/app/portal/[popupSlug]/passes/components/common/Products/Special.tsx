import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ProductsPass } from "@/types/Products";
import { Check, Crown, Info, Plus } from 'lucide-react'
import { cn } from "@/lib/utils";

// HOC para manejar la lógica de presentación
const withSpecialProductPresentation = (WrappedComponent: React.ComponentType<any>) => {
  return function WithSpecialProductPresentation(props: SpecialProps) {
    const { selected, disabled } = props.product;
    
    const getStatusIcon = () => {
      if (disabled) {
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
    selected && "text-[#005F3A]"
  )}>
    <Crown className={cn("w-5 h-5 text-orange-500", disabled && "text-neutral-300")} />
    {product.name}
    {
      !disabled && (
        <TooltipPatreon />
      )
    }
  </span>
);

interface ProductPriceProps {
  product: ProductsPass;
  selected: boolean;
}

const ProductPrice = ({ product, selected }: ProductPriceProps) => (
  <span className={cn(
    "font-medium",
    selected && "text-[#005F3A]"
  )}>
    ${product.price.toLocaleString()}
  </span>
);

const TooltipPatreon = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="cursor-pointer">
        <Info className="w-4 h-4 text-gray-500" />
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
}

type VariantStyles = 'selected' | 'purchased' | 'edit' | 'disabled' | 'default'

const variants: Record<VariantStyles, string> = {
  selected: 'bg-green-200 border-green-400 text-green-800 hover:bg-green-200/80',
  purchased: 'bg-slate-800 text-white border-neutral-700',
  edit: 'bg-slate-800/30 border-dashed border-slate-200 text-neutral-700',
  disabled: 'bg-neutral-0 text-neutral-300 cursor-not-allowed ',
  default: 'bg-white border-neutral-300 text-neutral-700 hover:bg-slate-100',
}

// Componente base
function SpecialBase({ 
  product, 
  onClick,
  getStatusIcon
}: SpecialProps & { getStatusIcon: () => JSX.Element }) {

  const { selected, disabled, purchased } = product

  return (
    <button
      data-category="patreon"
      onClick={!disabled && onClick ? onClick : undefined}
      data-selected={selected}
      data-price={product.price}
      className={cn(
        'w-full py-1 px-4 flex items-center justify-between gap-2 border border-neutral-200 rounded-md',
        variants[disabled || !onClick ? 'disabled' : selected ? 'selected' : purchased ? 'purchased' : 'default']
      )}
    >
      <div className="flex items-center gap-2 py-2">
        {getStatusIcon()}
        <ProductTitle product={product} disabled={disabled || !onClick} selected={selected ?? false} />
      </div>
      
      <div className="flex items-center gap-4">
        {
          product.purchased ? (
            <span className="text-sm font-medium text-[#005F3A]">
              Purchased
            </span>
          ) : (
            <ProductPrice product={product} selected={selected ?? false} />
          )
        }
      </div>
    </button>
  );
}

// Exportar el componente envuelto con el HOC
export default withSpecialProductPresentation(SpecialBase);
