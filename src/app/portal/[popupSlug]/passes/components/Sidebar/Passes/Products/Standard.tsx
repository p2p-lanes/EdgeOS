'use client'

import { Check, Plus, LucideIcon, Ban, Crown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ProductsPass } from '@/types/Products';

interface TicketsBadgeProps {
  product: ProductsPass;
  iconTitle: LucideIcon
  selected?: boolean
  disabled: boolean;
  purchased?: boolean;
  onClick?: () => void
  isSpecial?: boolean
}

interface ProductTitleProps {
  isSpecial: boolean;
  product: ProductsPass;
  IconTitle: LucideIcon;
  showDates: boolean;
}

interface ProductDatesProps {
  start_date: string;
  end_date: string;
  selected: boolean;
}

interface ButtonClassesProps {
  disabled: boolean;
  selected: boolean;
  purchased: boolean;
  product: ProductsPass;
}

interface ProductPriceProps {
  purchased: boolean;
  disabled: boolean;
  product: ProductsPass;
  selected: boolean;
}

const withProductPresentation = (WrappedComponent: React.ComponentType<any>) => {
  return function WithProductPresentation(props: TicketsBadgeProps) {
    const { selected, disabled } = props;
    
    const getStatusIcon = () => {
      if (selected && !disabled) return <Check className="w-4 h-4" />;
      if (!disabled) return <Plus className="w-4 h-4" />;
      return null;
    };

    return <WrappedComponent {...props} getStatusIcon={getStatusIcon} />;
  };
};

const ProductTitle = ({ isSpecial, product, IconTitle, showDates }: ProductTitleProps) => (
  isSpecial ? (
    <div className="flex items-center gap-2 py-2">
      <Crown className="w-5 h-5 text-orange-500" />
      <span className="font-semibold text-md">{product.name}</span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <IconTitle className={cn(showDates ? "h-4 w-4" : "h-5 w-5")} />
      <span className="font-medium text-sm">{product.name}</span>
    </div>
  )
);

const ProductDates = ({ start_date, end_date, selected }: ProductDatesProps) => (
  <span className={cn(
    "text-xs text-nowrap", selected ? "text-[#005F3A]" : "text-gray-500"
  )}>
    {formatDate(start_date)} to {formatDate(end_date)}
  </span>
);

const ProductPrice = ({ purchased, disabled, product, selected }: ProductPriceProps) => {
  const price = product.price
  const originalPrice = product.compare_price ?? price

  const getPriceDisplay = () => {
    if (purchased) {
      return (
        <span className="text-sm font-medium text-[#005F3A]">
          Purchased
        </span>
      );
    }

    if (disabled) {
      return (
        <span className="text-sm font-medium text-gray-500">
          <Ban className="w-4 h-4" />
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {
          originalPrice !== price && (
            <p className="text-xs text-muted-foreground line-through">
              ${originalPrice.toLocaleString()}
            </p>
          )
        }
        <span className={cn(
          "text-sm font-medium",
          selected ? "text-[#005F3A]" : "text-gray-900"
        )}>
          ${price.toLocaleString()}
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-center">
      {getPriceDisplay()}
    </div>
  );
};

// Componente base
function StandardBase({
  product,
  disabled,
  iconTitle: IconTitle,
  selected = false,
  purchased = false,
  onClick,
  isSpecial = false,
  getStatusIcon,
  ...rest
}: TicketsBadgeProps & { getStatusIcon: () => JSX.Element | null }) {
  const hasDates = !!(product.start_date && product.end_date);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={getButtonClasses({ disabled, selected, purchased, product })}
      {...rest}
    >
      <div className="flex items-center">
        <div className="flex items-center w-6 h-6">
          {getStatusIcon()}
        </div>
        <div className={cn("flex flex-col items-start", !hasDates && !isSpecial ? "py-2" : "")}>
          <ProductTitle 
            isSpecial={isSpecial} 
            product={product} 
            IconTitle={IconTitle} 
            showDates={hasDates} 
          />
          {product.start_date && product.end_date && !isSpecial && (
            <ProductDates start_date={product.start_date} end_date={product.end_date} selected={selected} />
          )}
        </div>
      </div>
      <ProductPrice
        purchased={purchased} 
        disabled={disabled} 
        product={product} 
        selected={selected} 
      />
    </button>
  );
}

// Exportar el componente envuelto con el HOC
export default withProductPresentation(StandardBase);

// Utilidades
const formatDate = (date: string | undefined) => {
  return new Date(date ?? '').toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const getButtonClasses = ({ disabled, selected, purchased, product }: ButtonClassesProps) => {
  return cn(
    "flex items-center justify-between w-full px-3 py-1 transition-colors rounded-full",
    "border border-gray-200 hover:bg-gray-100",
    disabled && "bg-gray-200 hover:bg-gray-200 text-gray-600 cursor-default border-gray-300",
    selected && "bg-[#D5F7CC] hover:bg-[#D5F7CC] text-[#005F3A] border-[#16a34a]",
    purchased && "bg-[#f1ffed] hover:bg-[#f1ffed] text-[#005F3A] border-[transparent]",
    (product.exclusive || product.attendee_category === 'kid') && "sm:col-span-2 3xl:col-span-3"
  );
};
