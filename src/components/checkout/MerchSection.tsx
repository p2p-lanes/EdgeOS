'use client';

import { useState } from 'react';
import { Minus, Plus, Info, X, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/providers/checkoutProvider';
import { ProductsProps } from '@/types/Products';
import { formatCurrency } from '@/types/checkout';

const DEV_TOGGLE = true;
type MerchVariant = 'default' | 'grid' | 'minimal';
const VARIANT_LIST: MerchVariant[] = ['default', 'grid', 'minimal'];

interface MerchSectionProps {
  onSkip?: () => void;
}

// Placeholder images for merch items when no image is available
const MERCH_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&auto=format&fit=crop&q=80',
];

function getMerchImage(index: number): string {
  return MERCH_IMAGES[index % MERCH_IMAGES.length];
}

function DefaultMerchVariant({ onSkip }: MerchSectionProps) {
  const { merchProducts, cart, updateMerchQuantity } = useCheckout();

  const getQuantity = (productId: number): number => {
    const item = cart.merch.find((m) => m.productId === productId);
    return item?.quantity || 0;
  };

  const handleSkip = () => {
    onSkip?.();
  };

  if (merchProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Merchandise Available
        </h3>
        <p className="text-gray-500 max-w-md mb-6">
          Merchandise is not currently available for this event.
          You can continue to the next step.
        </p>
        <Button variant="outline" onClick={handleSkip}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Merch Items List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {merchProducts.map((product, index) => (
          <MerchItem
            key={product.id}
            product={product}
            quantity={getQuantity(product.id)}
            onQuantityChange={(qty) => updateMerchQuantity(product.id, qty)}
            imageUrl={getMerchImage(index)}
            showDiscount={index < 2} // Only first 2 products show discount styling
          />
        ))}
      </div>

      {/* Skip Option */}
      <div className="text-center py-2">
        <button
          onClick={handleSkip}
          className="text-gray-500 hover:text-gray-700 underline text-sm transition-colors"
        >
          Skip merchandise
        </button>
      </div>
    </div>
  );
}

interface MerchItemProps {
  product: ProductsProps;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  imageUrl: string;
  showDiscount?: boolean; // Control whether to display discount styling
}

function MerchItem({ product, quantity, onQuantityChange, imageUrl, showDiscount = false }: MerchItemProps) {
  const [activeTooltip, setActiveTooltip] = useState(false);
  const hasQuantity = quantity > 0;
  // Only show discount if showDiscount is true AND product has compare_price > price
  const hasDiscount = showDiscount && product.compare_price && product.compare_price > product.price;

  return (
    <div
      className={cn(
        'p-4 transition-colors',
        hasQuantity ? 'bg-blue-50/50' : ''
      )}
    >
      {/* ===== DESKTOP LAYOUT (md+): Horizontal row ===== */}
      <div className="hidden md:flex items-center gap-3">
        {/* Quantity Controls */}
        <QuantityControls
          quantity={quantity}
          onIncrement={() => onQuantityChange(quantity + 1)}
          onDecrement={() => onQuantityChange(Math.max(0, quantity - 1))}
        />

        {/* Product Image */}
        <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-medium text-gray-900 text-sm">
              {product.name}
            </h3>
            {product.description && (
              <Tooltip
                content={product.description}
                isActive={activeTooltip}
                onToggle={() => setActiveTooltip(!activeTooltip)}
                onClose={() => setActiveTooltip(false)}
              />
            )}
          </div>
          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <PriceDisplay
          price={product.price}
          comparePrice={showDiscount ? product.compare_price ?? undefined : undefined}
          quantity={quantity}
        />
      </div>

      {/* ===== MOBILE LAYOUT (below md): Stacked for better readability ===== */}
      <div className="md:hidden">
        {/* Top section: Image + Title/Description */}
        <div className="flex gap-3 mb-3">
          {/* Product Image */}
          <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <h3 className="font-semibold text-gray-900 text-sm">
                {product.name}
              </h3>
              {product.description && (
                <Tooltip
                  content={product.description}
                  isActive={activeTooltip}
                  onToggle={() => setActiveTooltip(!activeTooltip)}
                  onClose={() => setActiveTooltip(false)}
                />
              )}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">
              {product.description}
            </p>
            {/* Unit price for mobile */}
            {hasDiscount && product.compare_price && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.compare_price)}
                </span>
                <span className="text-xs text-green-600 font-medium">
                  {formatCurrency(product.price)} each
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom section: Controls + Subtotal */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <QuantityControls
            quantity={quantity}
            onIncrement={() => onQuantityChange(quantity + 1)}
            onDecrement={() => onQuantityChange(Math.max(0, quantity - 1))}
          />
          <div className="text-right">
            {hasQuantity && quantity > 1 && (
              <p className="text-xs text-gray-400 mb-0.5">
                {quantity} × {formatCurrency(product.price)}
              </p>
            )}
            <span className={cn(
              'text-base font-bold',
              hasQuantity ? 'text-blue-600' : 'text-gray-500'
            )}>
              {formatCurrency(hasQuantity ? product.price * quantity : product.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuantityControlsProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

function QuantityControls({ quantity, onIncrement, onDecrement }: QuantityControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onDecrement}
        disabled={quantity === 0}
        aria-label="Decrease quantity"
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
          quantity === 0
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        )}
      >
        <Minus className="w-4 h-4" aria-hidden="true" />
      </button>
      <span className={cn(
        'w-6 text-center font-semibold text-sm',
        quantity > 0 ? 'text-blue-600' : 'text-gray-400'
      )}>
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

interface TooltipProps {
  content: string;
  isActive: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function Tooltip({ content, isActive, onToggle, onClose }: TooltipProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="More info"
      >
        <Info className="w-4 h-4" />
      </button>

      {isActive && (
        <>
          {/* Backdrop for mobile */}
          <button
            type="button"
            aria-label="Close tooltip"
            className="fixed inset-0 z-40 sm:hidden cursor-default"
            onClick={onClose}
          />
          {/* Tooltip content */}
          <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-1 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
            <button
              onClick={onClose}
              aria-label="Close tooltip"
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white sm:hidden"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
            <p className="leading-relaxed pr-4 sm:pr-0">{content}</p>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45" />
          </div>
        </>
      )}
    </div>
  );
}

interface PriceDisplayProps {
  price: number;
  comparePrice?: number;
  quantity: number;
}

function PriceDisplay({ price, comparePrice, quantity }: PriceDisplayProps) {
  const hasDiscount = comparePrice && comparePrice > price;
  const hasQuantity = quantity > 0;
  const displayPrice = hasQuantity ? price * quantity : price;
  const displayOriginal = hasQuantity && comparePrice ? comparePrice * quantity : comparePrice;

  return (
    <div className="text-right">
      {hasQuantity && quantity > 1 && (
        <p className="text-xs text-gray-400">
          {quantity} × {formatCurrency(price)}
        </p>
      )}
      <div className="flex items-center gap-1.5 justify-end">
        {hasDiscount && displayOriginal && (
          <span className="text-xs text-gray-400 line-through">
            {formatCurrency(displayOriginal)}
          </span>
        )}
        <span className={cn(
          'font-semibold',
          hasQuantity ? 'text-blue-600' : hasDiscount ? 'text-green-600' : 'text-gray-500'
        )}>
          {formatCurrency(displayPrice)}
        </span>
      </div>
      {hasDiscount && !hasQuantity && comparePrice && (
        <p className="text-xs text-green-600 font-medium">
          Save {formatCurrency(comparePrice - price)}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GRID — 2-column e-commerce style grid
// ═══════════════════════════════════════════════════════════════

function GridMerchVariant({ onSkip }: MerchSectionProps) {
  const { merchProducts, cart, updateMerchQuantity } = useCheckout();
  const getQuantity = (productId: number) => cart.merch.find((m) => m.productId === productId)?.quantity || 0;

  if (merchProducts.length === 0) {
    return (<div className="flex flex-col items-center justify-center py-12 text-center"><ShoppingBag className="w-12 h-12 text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No Merchandise</h3><Button variant="outline" onClick={onSkip}>Continue</Button></div>);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {merchProducts.map((product, index) => {
          const quantity = getQuantity(product.id);
          const hasQuantity = quantity > 0;
          return (
            <div key={product.id} className={cn('rounded-2xl border overflow-hidden transition-all', hasQuantity ? 'border-blue-200 shadow-md' : 'border-gray-100 shadow-sm')}>
              <div className="relative h-32">
                <img src={getMerchImage(index)} alt={product.name} className="w-full h-full object-cover" />
                {hasQuantity && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">{quantity}</div>
                )}
              </div>
              <div className="p-3 bg-white">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(product.price)}</p>
                <div className="flex items-center justify-between mt-2">
                  <QuantityControls quantity={quantity} onIncrement={() => updateMerchQuantity(product.id, quantity + 1)} onDecrement={() => updateMerchQuantity(product.id, Math.max(0, quantity - 1))} />
                  {hasQuantity && quantity > 1 && (
                    <span className="text-xs font-bold text-blue-600">{formatCurrency(product.price * quantity)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center py-2">
        <button onClick={onSkip} className="text-gray-500 hover:text-gray-700 underline text-sm transition-colors">Skip merchandise</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MINIMAL — Compact list without images
// ═══════════════════════════════════════════════════════════════

function MinimalMerchVariant({ onSkip }: MerchSectionProps) {
  const { merchProducts, cart, updateMerchQuantity } = useCheckout();
  const getQuantity = (productId: number) => cart.merch.find((m) => m.productId === productId)?.quantity || 0;

  if (merchProducts.length === 0) {
    return (<div className="flex flex-col items-center justify-center py-12 text-center"><ShoppingBag className="w-12 h-12 text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No Merchandise</h3><Button variant="outline" onClick={onSkip}>Continue</Button></div>);
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        {merchProducts.map((product) => {
          const quantity = getQuantity(product.id);
          const hasQuantity = quantity > 0;
          return (
            <div key={product.id} className={cn('flex items-center justify-between px-4 py-3 transition-colors', hasQuantity ? 'bg-blue-50/50' : '')}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <QuantityControls quantity={quantity} onIncrement={() => updateMerchQuantity(product.id, quantity + 1)} onDecrement={() => updateMerchQuantity(product.id, Math.max(0, quantity - 1))} />
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
                  {product.description && <p className="text-xs text-gray-500 truncate">{product.description}</p>}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                {hasQuantity && quantity > 1 && <p className="text-[10px] text-gray-400">{quantity} × {formatCurrency(product.price)}</p>}
                <span className={cn('text-sm font-semibold', hasQuantity ? 'text-blue-600' : 'text-gray-500')}>{formatCurrency(hasQuantity ? product.price * quantity : product.price)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center py-1">
        <button onClick={onSkip} className="text-gray-500 hover:text-gray-700 underline text-sm transition-colors">Skip merchandise</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEV TOGGLE & MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

const MerchDevToggleBar = ({ variant, onChange }: { variant: MerchVariant; onChange: (v: MerchVariant) => void }) => (
  <div className="flex items-center gap-1 mb-2 font-mono text-[10px]">
    <span className="text-gray-400 mr-1">Merch:</span>
    {VARIANT_LIST.map((v) => (
      <button key={v} onClick={() => onChange(v)} aria-label={`Switch to ${v} merch variant`} tabIndex={0}
        className={cn('px-2 py-0.5 rounded transition-colors capitalize', variant === v ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
        {v}
      </button>
    ))}
  </div>
);

const MERCH_VARIANT_MAP: Record<MerchVariant, React.ComponentType<MerchSectionProps>> = {
  default: DefaultMerchVariant,
  grid: GridMerchVariant,
  minimal: MinimalMerchVariant,
};

export default function MerchSection(props: MerchSectionProps) {
  const [variant, setVariant] = useState<MerchVariant>('default');
  const VariantComponent = MERCH_VARIANT_MAP[variant];
  return (
    <div>
      {DEV_TOGGLE && <MerchDevToggleBar variant={variant} onChange={setVariant} />}
      <VariantComponent {...props} />
    </div>
  );
}
