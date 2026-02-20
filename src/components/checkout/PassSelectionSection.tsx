'use client';

import { useState } from 'react';
import { Plus, User, Ticket, Check, Sparkles, Minus, PencilIcon, XIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePassesProvider } from '@/providers/passesProvider';
import { useCityProvider } from '@/providers/cityProvider';
import { AttendeeProps, AttendeeCategory } from '@/types/Attendee';
import { ProductsPass } from '@/types/Products';
import { formatDate } from '@/helpers/dates';
import { badgeName } from '../utils/multiuse';

const DEV_TOGGLE = true;
type PassVariant = 'default' | 'compact' | 'accordion';
const VARIANT_LIST: PassVariant[] = ['default', 'compact', 'accordion'];

interface PassSelectionSectionProps {
  onAddAttendee?: (category: AttendeeCategory) => void;
}

const getCategoryLabel = (category: AttendeeCategory): string => {
  return badgeName[category] || category;
};

// Sort products: month first, then weeks in order, then day
const sortProductsByPriority = (a: ProductsPass, b: ProductsPass): number => {
  const getPriority = (cat: string) => {
    const normalized = cat.toLowerCase();
    if (normalized.includes('month')) return 0;
    if (normalized.includes('week')) return 1;
    if (normalized.includes('day')) return 2;
    return 3;
  };
  return getPriority(a.category) - getPriority(b.category);
};

// Diagonal striped pattern style for section headers
const stripedPatternStyle = {
  backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 6px)'
};

function DefaultVariant({ onAddAttendee }: PassSelectionSectionProps) {
  const { attendeePasses, toggleProduct, isEditing, toggleEditing, editCredit } = usePassesProvider();
  const { getCity } = useCityProvider();
  const city = getCity();

  // Check if spouse exists
  const hasSpouse = attendeePasses.some(a => a.category === 'spouse');
  const somePurchased = attendeePasses.some(a => a.products.some(p => p.purchased));

  const handleAddSpouse = () => {
    if (onAddAttendee) {
      onAddAttendee('spouse');
    }
  };

  const handleAddChild = () => {
    if (onAddAttendee) {
      onAddAttendee('kid');
    }
  };

  const handleToggleEdit = () => {
    toggleEditing();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-3"
    >
      {/* Edit Mode Banner */}
      {isEditing && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">Edit Mode</p>
              <p className="text-sm text-blue-700">Click on a purchased pass to get credit, then select a new pass.</p>
            </div>
            {editCredit > 0 && (
              <div className="bg-blue-100 px-3 py-1.5 rounded-lg">
                <p className="text-sm font-semibold text-blue-800">Credit: ${editCredit.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Early Bird Banner - hidden in edit mode */}
      {!isEditing && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-full">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-900">Early Bird Pricing Active</p>
            <p className="text-sm text-amber-700">Save up to $200 per pass - limited time offer!</p>
          </div>
        </div>
      )}

      {/* Toolbar: Edit button + Add Family Members */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          {!isEditing && !hasSpouse && city?.allows_spouse && (
            <button
              onClick={handleAddSpouse}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add spouse
            </button>
          )}
          {!isEditing && city?.allows_children && (
            <button
              onClick={handleAddChild}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add child
            </button>
          )}
        </div>

        {/* Edit Passes button - temporarily disabled
        {somePurchased && (
          <button
            onClick={handleToggleEdit}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm',
              isEditing
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            )}
            aria-label={isEditing ? 'Cancel pass editing' : 'Edit passes'}
            tabIndex={0}
          >
            {isEditing ? (
              <>
                <XIcon className="w-4 h-4" />
                Cancel Editing
              </>
            ) : (
              <>
                <PencilIcon className="w-4 h-4" />
                Edit Passes
              </>
            )}
          </button>
        )}
        */}

      </div>

      {/* Family Member Pass Selection */}
      {attendeePasses.map((attendee) => (
        <AttendeePassCard
          key={attendee.id}
          attendee={attendee}
          toggleProduct={toggleProduct}
          city={city}
          isEditing={isEditing}
          allAttendees={attendeePasses}
        />
      ))}
    </motion.div>
  );
}

interface AttendeePassCardProps {
  attendee: AttendeeProps;
  toggleProduct: (attendeeId: number, product: ProductsPass) => void;
  city: any;
  isEditing: boolean;
  allAttendees: AttendeeProps[];
  hideHeader?: boolean;
}

function AttendeePassCard({ attendee, toggleProduct, city, isEditing, allAttendees, hideHeader = false }: AttendeePassCardProps) {
  const isChild = attendee.category === 'kid' || attendee.category === 'teen' || attendee.category === 'baby';
  const isSpouse = attendee.category === 'spouse';

  // Filter and sort products
  const standardProducts = attendee.products
    .filter((product) => product.category !== 'patreon')
    .sort(sortProductsByPriority);

  // Split into categories
  const monthProducts = standardProducts.filter(p =>
    p.category.toLowerCase().includes('month')
  );
  const weekProducts = standardProducts.filter(p =>
    p.category.toLowerCase().includes('week')
  );
  const dayProducts = standardProducts.filter(p =>
    p.category.toLowerCase().includes('day')
  );

  // Check for mutual exclusivity
  const hasMonthSelected = attendee.products.some(p =>
    p.category.toLowerCase().includes('month') && (p.purchased || p.selected)
  );
  const hasWeekSelected = attendee.products.some(p =>
    p.category.toLowerCase().includes('week') && (p.purchased || p.selected)
  );

  // Check if primary has a pass (for spouse validation)
  const primaryHasPass = (passId: number): boolean => {
    const primary = allAttendees.find(a => a.category === 'main');
    if (!primary) return true; // No restriction if no primary
    const primaryProduct = primary.products.find(p => p.id === passId);
    if (!primaryProduct) return true;
    // Check if primary has this pass or month pass selected
    const primaryHasMonth = primary.products.some(p =>
      p.category.toLowerCase().includes('month') && (p.purchased || p.selected)
    );
    return primaryProduct.purchased || primaryProduct.selected || primaryHasMonth;
  };

  return (
    <div className={cn(!hideHeader && 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden')}>
      {!hideHeader && (
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{attendee.name}</h3>
              <p className="text-sm text-gray-500">{getCategoryLabel(attendee.category)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Month Pass Section - Only for non-children */}
      {monthProducts.length > 0 && !isChild && (
        <>
          {/* Section Header with Diagonal Stripes */}
          <div className="relative px-5 py-2 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 overflow-hidden">
            <div className="absolute inset-0 opacity-100" style={stripedPatternStyle} />
            <div className="relative flex items-center gap-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Month Pass
              </h4>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>

          {/* Month Pass Options */}
          <div className="divide-y divide-gray-100">
            {monthProducts.map((product) => {
              const disabled = product.disabled;
              const disabledForSpouse = isSpouse && !primaryHasPass(product.id);
              const isDisabled = disabled || disabledForSpouse;

              return (
                <PassOption
                  key={product.id}
                  product={product}
                  onClick={() => toggleProduct(attendee.id, product)}
                  disabled={isDisabled}
                  disabledReason={disabledForSpouse ? 'Requires primary pass holder' : undefined}
                  isEditing={isEditing}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Weekly Passes Section */}
      {weekProducts.length > 0 && (
        <>
          {/* Section Header with Diagonal Stripes */}
          <div className="relative px-5 py-2 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 overflow-hidden">
            <div className="absolute inset-0 opacity-100" style={stripedPatternStyle} />
            <h4 className="relative text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Weekly Passes
            </h4>
          </div>

          {/* Weekly Pass Options - Flat List */}
          <div className="divide-y divide-gray-100">
            {weekProducts.map((product) => {
              const disabled = product.disabled || (hasMonthSelected);
              const disabledForSpouse = isSpouse && !primaryHasPass(product.id);
              const isDisabled = disabled || disabledForSpouse;

              return (
                <PassOption
                  key={product.id}
                  product={product}
                  onClick={() => toggleProduct(attendee.id, product)}
                  disabled={isDisabled}
                  disabledReason={disabledForSpouse ? 'Requires primary pass holder' : undefined}
                  isEditing={isEditing}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Day Passes Section */}
      {dayProducts.length > 0 && (
        <>
          {/* Section Header with Diagonal Stripes */}
          <div className="relative px-5 py-2 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 overflow-hidden">
            <div className="absolute inset-0 opacity-100" style={stripedPatternStyle} />
            <h4 className="relative text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Day Passes
            </h4>
          </div>

          {/* Day Pass Controls */}
          <div className="divide-y divide-gray-100">
            {dayProducts.map((product) => {
              const disabled = product.disabled || hasMonthSelected;
              const disabledForSpouse = isSpouse && !primaryHasPass(product.id);
              const isDisabled = disabled || disabledForSpouse;

              return (
                <DayPassOption
                  key={product.id}
                  product={product}
                  onQuantityChange={(quantity) => {
                    const updatedProduct = { ...product, quantity };
                    console.log('updatedProduct', quantity, updatedProduct);
                    toggleProduct(attendee.id, updatedProduct);
                  }}
                  disabled={isDisabled}
                  disabledReason={disabledForSpouse ? 'Requires primary pass holder' : undefined}
                  isEditing={isEditing}
                />
              );
            })}
          </div>
        </>
      )}

      {standardProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No passes available for this attendee category.
        </div>
      )}
    </div>
  );
}

interface PassOptionProps {
  product: ProductsPass;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
  isEditing?: boolean;
}


function PassOption({ product, onClick, disabled, disabledReason, isEditing }: PassOptionProps) {
  const { purchased, selected } = product;
  const isEditedForCredit = purchased && product.edit;
  const comparePrice = product.compare_price ?? product.original_price;
  const hasDiscount = comparePrice && comparePrice > product.price;

  const isClickable = !disabled && (!purchased || isEditing);
  const isSelected = selected && !purchased;

  // If purchased and NOT in editing mode: show "Owned" state
  if (purchased && !isEditing) {
    return (
      <div
        className="w-full px-5 py-3 flex items-center justify-between gap-4 cursor-not-allowed"
        style={{
          backgroundColor: '#f9f9f9',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)',
        }}
      >
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-300" />
            <span className="font-medium text-gray-400">{product.name}</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold uppercase rounded tracking-wide border border-slate-200">
              Owned
            </span>
          </div>
          {product.start_date && product.end_date && (
            <p className="text-sm text-gray-400 ml-6">
              {formatDate(product.start_date, { day: 'numeric', month: 'short' })} - {formatDate(product.end_date, { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Purchased in edit mode: clickable to give up for credit
  if (purchased && isEditing) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full px-5 py-3 flex items-center justify-between gap-4 transition-all',
          isEditedForCredit
            ? 'bg-orange-50 border-l-4 border-l-orange-400'
            : 'bg-gray-50 hover:bg-gray-100'
        )}
        aria-label={isEditedForCredit ? `Undo credit for ${product.name}` : `Get credit for ${product.name}`}
        tabIndex={0}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all border-dashed',
              isEditedForCredit
                ? 'bg-orange-100 border-orange-400'
                : 'border-gray-400'
            )}
          >
            {isEditedForCredit && <Check className="w-3 h-3 text-orange-600" />}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <Ticket className={cn('w-4 h-4', isEditedForCredit ? 'text-orange-400' : 'text-gray-400')} />
              <span className={cn('font-medium', isEditedForCredit ? 'text-orange-700 line-through' : 'text-gray-700')}>
                {product.name}
              </span>
              <span className={cn(
                'px-2 py-0.5 text-[10px] font-semibold uppercase rounded tracking-wide border',
                isEditedForCredit
                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              )}>
                {isEditedForCredit ? 'Credit' : 'Owned'}
              </span>
            </div>
            {product.start_date && product.end_date && (
              <p className={cn('text-sm ml-8', isEditedForCredit ? 'text-orange-500' : 'text-gray-400')}>
                {formatDate(product.start_date, { day: 'numeric', month: 'short' })} - {formatDate(product.end_date, { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={cn(
            'font-semibold',
            isEditedForCredit ? 'text-orange-600' : 'text-gray-500'
          )}>
            {isEditedForCredit ? `+$${product.price.toLocaleString()}` : `$${product.price.toLocaleString()}`}
          </p>
          {isEditedForCredit && (
            <p className="text-[10px] text-orange-500 font-medium">credit</p>
          )}
        </div>
      </button>
    );
  }

  // Normal (not purchased) state
  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        'w-full px-5 py-3 flex items-center justify-between gap-4 transition-all',
        disabled
          ? 'opacity-40 cursor-not-allowed bg-gray-50'
          : isSelected
          ? 'bg-blue-50'
          : 'hover:bg-gray-50'
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Checkbox */}
        <div
          className={cn(
            'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
            isSelected
              ? 'bg-blue-600 border-blue-600'
              : disabled
              ? 'border-gray-200'
              : 'border-gray-300'
          )}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{product.name}</span>
          </div>
          {product.start_date && product.end_date && (
            <p className="text-sm text-gray-500">
              {formatDate(product.start_date, { day: 'numeric', month: 'short' })} - {formatDate(product.end_date, { day: 'numeric', month: 'short' })}
            </p>
          )}
          {disabledReason && (
            <p className="text-xs text-amber-600 mt-1">{disabledReason}</p>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        {hasDiscount && (
          <p className="text-xs text-gray-400 line-through">
            ${comparePrice?.toLocaleString()}
          </p>
        )}
        <p className={cn(
          'font-semibold',
          isSelected ? 'text-blue-600' : 'text-gray-900'
        )}>
          ${product.price.toLocaleString()}
        </p>
      </div>
    </button>
  );
}

interface DayPassOptionProps {
  product: ProductsPass;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
  disabledReason?: string;
  isEditing?: boolean;
}

function DayPassOption({ product, onQuantityChange, disabled, disabledReason, isEditing }: DayPassOptionProps) {
  const { purchased } = product;
  const isEditedForCredit = purchased && product.edit;
  const quantity = product.quantity ?? 0;
  const originalQuantity = product.original_quantity ?? 0;
  const comparePrice = product.compare_price ?? product.price;
  const hasDiscount = comparePrice > product.price;

  // Calculate max quantity based on date range
  const calculateMaxQuantity = () => {
    if (!product.start_date || !product.end_date) return 30;
    const start = new Date(product.start_date);
    const end = new Date(product.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const maxQuantity = calculateMaxQuantity();
  const isMaxReached = quantity >= maxQuantity;
  const isMinReached = purchased && quantity <= originalQuantity && !isEditing;
  const hasQuantity = quantity > 0;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMaxReached && !disabled) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMinReached && quantity > 0 && !disabled) {
      onQuantityChange(quantity - 1);
    }
  };

  // In edit mode with purchased day pass: show as editable credit option
  if (purchased && isEditing) {
    const creditAmount = product.price * (product.quantity ?? 1);

    const handleEditClick = () => {
      // Use toggleProduct through the parent's onQuantityChange pattern
      // For day passes in edit mode, toggle the edit flag via the EditProductStrategy
      onQuantityChange(isEditedForCredit ? originalQuantity : 0);
    };

    return (
      <button
        onClick={handleEditClick}
        className={cn(
          'w-full px-5 py-3 flex items-center justify-between gap-4 transition-all',
          isEditedForCredit
            ? 'bg-orange-50 border-l-4 border-l-orange-400'
            : 'bg-gray-50 hover:bg-gray-100'
        )}
        aria-label={isEditedForCredit ? `Undo credit for ${product.name}` : `Get credit for ${product.name}`}
        tabIndex={0}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all border-dashed',
              isEditedForCredit
                ? 'bg-orange-100 border-orange-400'
                : 'border-gray-400'
            )}
          >
            {isEditedForCredit && <Check className="w-3 h-3 text-orange-600" />}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <Ticket className={cn('w-4 h-4', isEditedForCredit ? 'text-orange-400' : 'text-gray-400')} />
              <span className={cn('font-medium', isEditedForCredit ? 'text-orange-700 line-through' : 'text-gray-700')}>
                {product.name} ({originalQuantity} {originalQuantity === 1 ? 'day' : 'days'})
              </span>
              <span className={cn(
                'px-2 py-0.5 text-[10px] font-semibold uppercase rounded tracking-wide border',
                isEditedForCredit
                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              )}>
                {isEditedForCredit ? 'Credit' : 'Owned'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={cn(
            'font-semibold',
            isEditedForCredit ? 'text-orange-600' : 'text-gray-500'
          )}>
            {isEditedForCredit ? `+$${creditAmount.toLocaleString()}` : `$${creditAmount.toLocaleString()}`}
          </p>
          {isEditedForCredit && (
            <p className="text-[10px] text-orange-500 font-medium">credit</p>
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'px-5 py-3 flex items-center justify-between gap-4',
        disabled ? 'opacity-40' : hasQuantity ? 'bg-blue-50' : ''
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Quantity Controls */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={handleDecrement}
            disabled={disabled || quantity === 0 || isMinReached}
            aria-label="Decrease day pass quantity"
            className={cn(
              'w-5 h-5 rounded flex items-center justify-center transition-all',
              disabled || quantity === 0 || isMinReached
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
          >
            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <span className={cn(
            'w-5 text-center font-semibold text-sm',
            hasQuantity ? 'text-blue-600' : 'text-gray-400'
          )}>
            {quantity}
          </span>
          <button
            onClick={handleIncrement}
            disabled={disabled || isMaxReached}
            aria-label="Increase day pass quantity"
            className={cn(
              'w-5 h-5 rounded flex items-center justify-center transition-all',
              disabled || isMaxReached
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{product.name}</span>
          </div>
          <p className="text-sm text-gray-500">per day</p>
          {disabledReason && (
            <p className="text-xs text-amber-600 mt-1">{disabledReason}</p>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        {hasDiscount && (
          <p className="text-xs text-gray-400 line-through">
            ${comparePrice.toLocaleString()}
          </p>
        )}
        <p className={cn(
          'font-semibold',
          hasQuantity ? 'text-blue-600' : 'text-gray-900'
        )}>
          ${product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPACT — Table-like layout, attendees stacked, products inline
// ═══════════════════════════════════════════════════════════════

function CompactVariant({ onAddAttendee }: PassSelectionSectionProps) {
  const { attendeePasses, toggleProduct, isEditing, toggleEditing, editCredit } = usePassesProvider();
  const { getCity } = useCityProvider();
  const city = getCity();
  const hasSpouse = attendeePasses.some(a => a.category === 'spouse');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PencilIcon className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Edit Mode</span>
          </div>
          {editCredit > 0 && (
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              Credit: ${editCredit.toLocaleString()}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {!isEditing && !hasSpouse && city?.allows_spouse && (
          <button onClick={() => onAddAttendee?.('spouse')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all">
            <Plus className="w-3 h-3" /> Spouse
          </button>
        )}
        {!isEditing && city?.allows_children && (
          <button onClick={() => onAddAttendee?.('kid')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all">
            <Plus className="w-3 h-3" /> Child
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {attendeePasses.map((attendee) => {
          const standardProducts = attendee.products.filter(p => p.category !== 'patreon').sort(sortProductsByPriority);
          const hasMonthSelected = attendee.products.some(p => p.category.toLowerCase().includes('month') && (p.purchased || p.selected));
          const isChild = attendee.category === 'kid' || attendee.category === 'teen' || attendee.category === 'baby';
          const isSpouse = attendee.category === 'spouse';

          const primaryHasPass = (passId: number): boolean => {
            const primary = attendeePasses.find(a => a.category === 'main');
            if (!primary) return true;
            const pp = primary.products.find(p => p.id === passId);
            if (!pp) return true;
            const primaryHasMonth = primary.products.some(p => p.category.toLowerCase().includes('month') && (p.purchased || p.selected));
            return pp.purchased || pp.selected || primaryHasMonth;
          };

          return (
            <div key={attendee.id} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">{attendee.name}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">{getCategoryLabel(attendee.category)}</span>
              </div>
              <div className="space-y-1">
                {standardProducts.map((product) => {
                  const { purchased, selected } = product;
                  const isSelected = selected && !purchased;
                  const disabled = product.disabled || (product.category.toLowerCase().includes('week') && hasMonthSelected) || (product.category.toLowerCase().includes('day') && hasMonthSelected) || (product.category.toLowerCase().includes('month') && isChild);
                  const disabledForSpouse = isSpouse && !primaryHasPass(product.id);
                  const isDisabled = disabled || disabledForSpouse;
                  const isClickable = !isDisabled && (!purchased || isEditing);
                  const isEditedForCredit = purchased && product.edit;

                  if (purchased && !isEditing) {
                    return (
                      <div key={product.id} className="flex items-center justify-between py-1 opacity-50">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                          <span className="text-xs text-gray-400">{product.name}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase font-semibold">owned</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button key={product.id} onClick={isClickable ? () => toggleProduct(attendee.id, product) : undefined} disabled={!isClickable} aria-label={`Toggle ${product.name}`} tabIndex={0}
                      className={cn('w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-all', isDisabled ? 'opacity-30 cursor-not-allowed' : isEditedForCredit ? 'bg-orange-50' : isSelected ? 'bg-blue-50' : 'hover:bg-gray-50')}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0', isEditedForCredit ? 'bg-orange-100 border-orange-400' : isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300')}>
                          {(isSelected || isEditedForCredit) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={cn('text-xs font-medium', isEditedForCredit ? 'text-orange-700 line-through' : isSelected ? 'text-blue-700' : 'text-gray-700')}>{product.name}</span>
                      </div>
                      <span className={cn('text-xs font-semibold tabular-nums', isEditedForCredit ? 'text-orange-600' : isSelected ? 'text-blue-600' : 'text-gray-500')}>${product.price.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACCORDION — Collapsible attendee sections, one open at a time
// ═══════════════════════════════════════════════════════════════

function AccordionVariant({ onAddAttendee }: PassSelectionSectionProps) {
  const { attendeePasses, toggleProduct, isEditing, toggleEditing, editCredit } = usePassesProvider();
  const { getCity } = useCityProvider();
  const city = getCity();
  const hasSpouse = attendeePasses.some(a => a.category === 'spouse');
  const [openAttendeeId, setOpenAttendeeId] = useState<number | null>(attendeePasses[0]?.id ?? null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      {isEditing && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">Edit Mode</p>
              <p className="text-sm text-blue-700">Click on a purchased pass to get credit.</p>
            </div>
            {editCredit > 0 && (
              <div className="bg-blue-100 px-3 py-1.5 rounded-lg">
                <p className="text-sm font-semibold text-blue-800">Credit: ${editCredit.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Early Bird Pricing</p>
            <p className="text-xs text-amber-700">Save up to $200 per pass!</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {!isEditing && !hasSpouse && city?.allows_spouse && (
          <button onClick={() => onAddAttendee?.('spouse')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add spouse
          </button>
        )}
        {!isEditing && city?.allows_children && (
          <button onClick={() => onAddAttendee?.('kid')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add child
          </button>
        )}
      </div>

      <div className="space-y-2">
        {attendeePasses.map((attendee) => {
          const isOpen = openAttendeeId === attendee.id;
          const selectedCount = attendee.products.filter(p => p.selected && p.category !== 'patreon').length;
          const purchasedCount = attendee.products.filter(p => p.purchased && p.category !== 'patreon').length;

          return (
            <div key={attendee.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button onClick={() => setOpenAttendeeId(prev => prev === attendee.id ? null : attendee.id)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors" aria-expanded={isOpen} aria-label={`Toggle ${attendee.name} passes`} tabIndex={0}>
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full"><User className="w-4 h-4 text-gray-600" /></div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{attendee.name}</h3>
                    <p className="text-xs text-gray-500">
                      {getCategoryLabel(attendee.category)}
                      {selectedCount > 0 && <span className="text-blue-600 ml-1">· {selectedCount} selected</span>}
                      {purchasedCount > 0 && <span className="text-slate-400 ml-1">· {purchasedCount} owned</span>}
                    </p>
                  </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                    <AttendeePassCard attendee={attendee} toggleProduct={toggleProduct} city={city} isEditing={isEditing} allAttendees={attendeePasses} hideHeader />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEV TOGGLE & MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

const PassDevToggleBar = ({ variant, onChange }: { variant: PassVariant; onChange: (v: PassVariant) => void }) => (
  <div className="flex items-center gap-1 mb-2 font-mono text-[10px]">
    <span className="text-gray-400 mr-1">Passes:</span>
    {VARIANT_LIST.map((v) => (
      <button key={v} onClick={() => onChange(v)} aria-label={`Switch to ${v} pass variant`} tabIndex={0}
        className={cn('px-2 py-0.5 rounded transition-colors capitalize', variant === v ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
        {v}
      </button>
    ))}
  </div>
);

const PASS_VARIANT_MAP: Record<PassVariant, React.ComponentType<PassSelectionSectionProps>> = {
  default: DefaultVariant,
  compact: CompactVariant,
  accordion: AccordionVariant,
};

export default function PassSelectionSection(props: PassSelectionSectionProps) {
  const [variant, setVariant] = useState<PassVariant>('default');
  const VariantComponent = PASS_VARIANT_MAP[variant];

  return (
    <div>
      {DEV_TOGGLE && <PassDevToggleBar variant={variant} onChange={setVariant} />}
      <VariantComponent {...props} />
    </div>
  );
}
