'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Check, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/providers/checkoutProvider';
import { useCityProvider } from '@/providers/cityProvider';
import { ProductsProps } from '@/types/Products';
import { formatCurrency, calculateNights, formatDate } from '@/types/checkout';

const DEV_TOGGLE = true;
type HousingVariant = 'default' | 'gallery' | 'list';
const VARIANT_LIST: HousingVariant[] = ['default', 'gallery', 'list'];

interface HousingStepProps {
  onSkip?: () => void;
}

function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

// Placeholder images for housing properties when no image is available
const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80',
];

function getPropertyImage(index: number): string {
  return PROPERTY_IMAGES[index % PROPERTY_IMAGES.length];
}

function DefaultHousingVariant({ onSkip }: HousingStepProps) {
  const { housingProducts, cart, selectHousing, clearHousing } = useCheckout();
  const { getCity } = useCityProvider();
  const city = getCity();

  // Default dates based on city or a reasonable default (7 days from now)
  const defaultStart = useMemo(() => {
    const today = new Date();
    return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  }, []);

  const defaultEnd = useMemo(() => {
    const today = new Date();
    return new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  }, []);

  const [checkIn, setCheckIn] = useState<Date>(
    cart.housing?.checkIn ? new Date(cart.housing.checkIn) : defaultStart
  );
  const [checkOut, setCheckOut] = useState<Date>(
    cart.housing?.checkOut ? new Date(cart.housing.checkOut) : defaultEnd
  );
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    cart.housing?.productId || null
  );

  const nights = calculateNights(formatDateInput(checkIn), formatDateInput(checkOut));

  // Update housing selection when dates or product change
  useEffect(() => {
    if (selectedProductId) {
      selectHousing(
        selectedProductId,
        formatDateInput(checkIn),
        formatDateInput(checkOut)
      );
    }
  }, [selectedProductId, checkIn, checkOut, selectHousing]);

  const handleProductSelect = (productId: number) => {
    if (selectedProductId === productId) {
      setSelectedProductId(null);
      clearHousing();
    } else {
      setSelectedProductId(productId);
    }
  };

  const handleSkip = () => {
    setSelectedProductId(null);
    clearHousing();
    onSkip?.();
  };

  if (housingProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Home className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Housing Available
        </h3>
        <p className="text-gray-500 max-w-md mb-6">
          Housing options are not currently available for this event.
          You can continue to the next step.
        </p>
        <Button variant="outline" onClick={handleSkip}>
          Continue without housing
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selection - Compact */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900">
            {nights} night{nights !== 1 ? 's' : ''}: {formatDate(formatDateInput(checkIn))} - {formatDate(formatDateInput(checkOut))}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-gray-500 mb-1 sm:hidden">Check-in</label>
            <input
              type="date"
              value={formatDateInput(checkIn)}
              max={formatDateInput(checkOut)}
              onChange={(e) => setCheckIn(parseDate(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="hidden sm:block self-center text-gray-400">to</span>
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-gray-500 mb-1 sm:hidden">Check-out</label>
            <input
              type="date"
              value={formatDateInput(checkOut)}
              min={formatDateInput(checkIn)}
              onChange={(e) => setCheckOut(parseDate(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Property Cards - Stacked Full Width */}
      <div className="space-y-4">
        {housingProducts.map((product, index) => (
          <PropertyCard
            key={product.id}
            product={product}
            nights={nights}
            isSelected={selectedProductId === product.id}
            onSelect={() => handleProductSelect(product.id)}
            imageUrl={getPropertyImage(index)}
          />
        ))}
      </div>

      {/* No Housing Option - Underlined Text Link */}
      <div className="text-center py-2">
        <button
          onClick={handleSkip}
          className="text-gray-500 hover:text-gray-700 underline text-sm transition-colors"
        >
          I don't need housing
        </button>
      </div>
    </div>
  );
}

interface PropertyCardProps {
  product: ProductsProps;
  nights: number;
  isSelected: boolean;
  onSelect: () => void;
  imageUrl: string;
}

function PropertyCard({ product, nights, isSelected, onSelect, imageUrl }: PropertyCardProps) {
  const totalPrice = product.price * nights;
  const compareTotal = product.compare_price ? product.compare_price * nights : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Property Header with Image */}
      <div className="relative h-32 sm:h-40">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Logo Container - Top Left */}
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm rounded-lg p-2">
          <div aria-hidden="true" className="h-5 sm:h-6 w-14 sm:w-16 bg-white/30 rounded flex items-center justify-center">
            <Home className="w-4 h-4 text-white/80" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
          <h3 className="font-bold text-base sm:text-lg">{product.name}</h3>
          {product.description && (
            <p className="text-xs sm:text-sm text-white/80 line-clamp-1">{product.description}</p>
          )}
        </div>
      </div>

      {/* Room Option */}
      <div className="p-3 sm:p-4">
        <button
          onClick={onSelect}
          className={cn(
            'w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all',
            isSelected
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-100 bg-gray-50 hover:border-gray-200'
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Radio Button */}
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <div className="text-left min-w-0">
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                {product.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {formatCurrency(product.price)}/night
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            {compareTotal && compareTotal > totalPrice && (
              <p className="text-xs text-gray-400 line-through">
                {formatCurrency(compareTotal)}
              </p>
            )}
            <p className={cn(
              'font-bold text-base sm:text-lg',
              isSelected ? 'text-blue-600' : 'text-gray-900'
            )}>
              {formatCurrency(totalPrice)}
            </p>
            <p className="text-xs text-gray-500">total</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GALLERY — Grid of images, Airbnb-style
// ═══════════════════════════════════════════════════════════════

function GalleryVariant({ onSkip }: HousingStepProps) {
  const { housingProducts, cart, selectHousing, clearHousing } = useCheckout();
  const defaultStart = useMemo(() => new Date(Date.now() + 7 * 864e5), []);
  const defaultEnd = useMemo(() => new Date(Date.now() + 14 * 864e5), []);
  const [checkIn, setCheckIn] = useState<Date>(cart.housing?.checkIn ? new Date(cart.housing.checkIn) : defaultStart);
  const [checkOut, setCheckOut] = useState<Date>(cart.housing?.checkOut ? new Date(cart.housing.checkOut) : defaultEnd);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(cart.housing?.productId || null);
  const nights = calculateNights(formatDateInput(checkIn), formatDateInput(checkOut));

  useEffect(() => { if (selectedProductId) selectHousing(selectedProductId, formatDateInput(checkIn), formatDateInput(checkOut)); }, [selectedProductId, checkIn, checkOut, selectHousing]);

  const handleProductSelect = (productId: number) => {
    if (selectedProductId === productId) { setSelectedProductId(null); clearHousing(); }
    else setSelectedProductId(productId);
  };

  const handleSkip = () => { setSelectedProductId(null); clearHousing(); onSkip?.(); };

  if (housingProducts.length === 0) {
    return (<div className="flex flex-col items-center justify-center py-12 text-center"><Home className="w-12 h-12 text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No Housing Available</h3><Button variant="outline" onClick={handleSkip}>Continue without housing</Button></div>);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <input type="date" value={formatDateInput(checkIn)} max={formatDateInput(checkOut)} onChange={(e) => setCheckIn(parseDate(e.target.value))} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="hidden sm:block self-center text-gray-400 text-sm">to</span>
          <input type="date" value={formatDateInput(checkOut)} min={formatDateInput(checkIn)} onChange={(e) => setCheckOut(parseDate(e.target.value))} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{nights} night{nights !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {housingProducts.map((product, index) => {
          const isSelected = selectedProductId === product.id;
          const totalPrice = product.price * nights;
          return (
            <button key={product.id} onClick={() => handleProductSelect(product.id)} aria-label={`Select ${product.name}`} tabIndex={0}
              className={cn('relative rounded-2xl overflow-hidden border-2 transition-all group text-left', isSelected ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-transparent hover:border-gray-200 shadow-sm')}>
              <div className="relative h-36 sm:h-44">
                <img src={getPropertyImage(index)} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {isSelected && (<div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" strokeWidth={3} /></div>)}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-bold text-white text-sm">{product.name}</h3>
                  {product.description && <p className="text-white/70 text-xs line-clamp-1">{product.description}</p>}
                </div>
              </div>
              <div className="bg-white px-3 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-500">{formatCurrency(product.price)}/night</span>
                <span className={cn('text-sm font-bold', isSelected ? 'text-blue-600' : 'text-gray-900')}>{formatCurrency(totalPrice)}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-center py-2">
        <button onClick={handleSkip} className="text-gray-500 hover:text-gray-700 underline text-sm transition-colors">I don&apos;t need housing</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LIST — Compact vertical list, no images
// ═══════════════════════════════════════════════════════════════

function ListVariant({ onSkip }: HousingStepProps) {
  const { housingProducts, cart, selectHousing, clearHousing } = useCheckout();
  const defaultStart = useMemo(() => new Date(Date.now() + 7 * 864e5), []);
  const defaultEnd = useMemo(() => new Date(Date.now() + 14 * 864e5), []);
  const [checkIn, setCheckIn] = useState<Date>(cart.housing?.checkIn ? new Date(cart.housing.checkIn) : defaultStart);
  const [checkOut, setCheckOut] = useState<Date>(cart.housing?.checkOut ? new Date(cart.housing.checkOut) : defaultEnd);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(cart.housing?.productId || null);
  const nights = calculateNights(formatDateInput(checkIn), formatDateInput(checkOut));

  useEffect(() => { if (selectedProductId) selectHousing(selectedProductId, formatDateInput(checkIn), formatDateInput(checkOut)); }, [selectedProductId, checkIn, checkOut, selectHousing]);

  const handleProductSelect = (productId: number) => {
    if (selectedProductId === productId) { setSelectedProductId(null); clearHousing(); }
    else setSelectedProductId(productId);
  };
  const handleSkip = () => { setSelectedProductId(null); clearHousing(); onSkip?.(); };

  if (housingProducts.length === 0) {
    return (<div className="flex flex-col items-center justify-center py-12 text-center"><Home className="w-12 h-12 text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No Housing Available</h3><Button variant="outline" onClick={handleSkip}>Continue</Button></div>);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-2 flex-1">
          <input type="date" value={formatDateInput(checkIn)} max={formatDateInput(checkOut)} onChange={(e) => setCheckIn(parseDate(e.target.value))} className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="text-gray-400">&ndash;</span>
          <input type="date" value={formatDateInput(checkOut)} min={formatDateInput(checkIn)} onChange={(e) => setCheckOut(parseDate(e.target.value))} className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <span className="text-xs text-gray-500 font-medium">{nights}n</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        {housingProducts.map((product) => {
          const isSelected = selectedProductId === product.id;
          const totalPrice = product.price * nights;
          return (
            <button key={product.id} onClick={() => handleProductSelect(product.id)} aria-label={`Select ${product.name}`} tabIndex={0}
              className={cn('w-full flex items-center justify-between px-4 py-3.5 transition-all text-left', isSelected ? 'bg-blue-50' : 'hover:bg-gray-50')}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0', isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300')}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                  {product.description && <p className="text-xs text-gray-500 truncate">{product.description}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(product.price)}/night × {nights}</p>
                </div>
              </div>
              <span className={cn('text-base font-bold flex-shrink-0 ml-3', isSelected ? 'text-blue-600' : 'text-gray-900')}>{formatCurrency(totalPrice)}</span>
            </button>
          );
        })}
      </div>

      <div className="text-center py-1">
        <button onClick={handleSkip} className="text-gray-500 hover:text-gray-700 underline text-sm transition-colors">Skip housing</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEV TOGGLE & MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

const HousingDevToggleBar = ({ variant, onChange }: { variant: HousingVariant; onChange: (v: HousingVariant) => void }) => (
  <div className="flex items-center gap-1 mb-2 font-mono text-[10px]">
    <span className="text-gray-400 mr-1">Housing:</span>
    {VARIANT_LIST.map((v) => (
      <button key={v} onClick={() => onChange(v)} aria-label={`Switch to ${v} housing variant`} tabIndex={0}
        className={cn('px-2 py-0.5 rounded transition-colors capitalize', variant === v ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
        {v}
      </button>
    ))}
  </div>
);

const HOUSING_VARIANT_MAP: Record<HousingVariant, React.ComponentType<HousingStepProps>> = {
  default: DefaultHousingVariant,
  gallery: GalleryVariant,
  list: ListVariant,
};

export default function HousingStep(props: HousingStepProps) {
  const [variant, setVariant] = useState<HousingVariant>('default');
  const VariantComponent = HOUSING_VARIANT_MAP[variant];
  return (
    <div>
      {DEV_TOGGLE && <HousingDevToggleBar variant={variant} onChange={setVariant} />}
      <VariantComponent {...props} />
    </div>
  );
}
