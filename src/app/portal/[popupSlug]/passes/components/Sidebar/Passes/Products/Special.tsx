import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ProductsPass } from "@/types/Products";
import { Check, Crown, Info, Plus } from 'lucide-react'
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// HOC para manejar la lógica de presentación
const withSpecialProductPresentation = (WrappedComponent: React.ComponentType<any>) => {
  return function WithSpecialProductPresentation(props: SpecialProps) {
    const { selected, disabled } = props;
    
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
}

const ProductTitle = ({ product, selected }: ProductTitleProps) => (
  <span className={cn(
    "font-semibold flex items-center gap-2",
    selected && "text-[#005F3A]"
  )}>
    <Crown className="w-5 h-5 text-orange-500" />
    {product.name}
    <TooltipPatreon />
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
    <TooltipTrigger>
      <Info className="w-4 h-4 text-gray-500" />
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
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

// Componente base
function SpecialBase({ 
  product, 
  disabled, 
  selected = false, 
  onClick,
  getStatusIcon 
}: SpecialProps & { getStatusIcon: () => JSX.Element }) {
  return (
    <Button 
      data-category="patreon"
      onClick={!disabled ? onClick : undefined}
      data-selected={selected}
      data-price={product.price}
      className={cn(
        "w-full rounded-full flex items-center justify-between py-1 px-4",
        "transition-all duration-300",
        selected && "cursor-pointer",
        selected || disabled 
          ? "border-2 border-[#16B74A] bg-[#D5F7CC]" 
          : "cursor-pointer border-2 border-gray-200 bg-transparent hover:bg-gray-100"
      )}
    >
      <div className="flex items-center gap-2 py-2">
        {getStatusIcon()}
        <ProductTitle product={product} selected={selected} />
      </div>
      
      <div className="flex items-center gap-4">
        {
          product.purchased ? (
            <span className="text-sm font-medium text-[#005F3A]">
              Purchased
            </span>
          ) : (
            <ProductPrice product={product} selected={selected} />
          )
        }
      </div>
    </Button>
  );
}

// Exportar el componente envuelto con el HOC
export default withSpecialProductPresentation(SpecialBase);
