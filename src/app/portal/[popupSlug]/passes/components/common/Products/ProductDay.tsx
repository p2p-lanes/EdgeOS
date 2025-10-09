"use client"

import { ProductsPass } from "@/types/Products"
import { Plus, Minus, Ticket, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/helpers/dates"
import { TooltipContent } from "@/components/ui/tooltip"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react" 
import { useSearchParams } from "next/navigation"
import { usePassesProvider } from "@/providers/passesProvider"

type VariantStyles = 'selected' | 'purchased' | 'edit' | 'disabled' | 'default'

const variants: Record<VariantStyles, string> = {
  selected: 'bg-green-200 border-green-400 text-green-800 hover:bg-green-200/80',
  purchased: 'bg-slate-800 text-white border-neutral-700',
  edit: 'bg-slate-800/30 border-dashed border-slate-200 text-neutral-700 border', 
  disabled: 'bg-neutral-0 text-neutral-300 cursor-not-allowed ',
  default: 'bg-white border-neutral-300 text-neutral-700 hover:bg-slate-100',
}

const Product = ({product, onClick, defaultDisabled, hasMonthPurchased}: {product: ProductsPass, onClick: (attendeeId: number | undefined, product: ProductsPass) => void, defaultDisabled?: boolean, hasMonthPurchased?: boolean}) => {
  const { isEditing } = usePassesProvider()
  const disabled = product.disabled || defaultDisabled || hasMonthPurchased || isEditing
  const originalPrice = product.compare_price ?? product.price
  const { purchased, selected } = product

  // Añadimos las clases de animación a Tailwind mediante CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .animate-fade-in-right {
        animation: fadeInRight 0.3s ease-out forwards;
      }
    `;
    
    // Verificamos si el estilo ya existe para evitar duplicados
    const existingStyle = document.querySelector('style[data-fade-animation]');
    if (!existingStyle) {
      style.setAttribute('data-fade-animation', 'true');
      document.head.appendChild(style);
    }
    
    // Limpieza al desmontar
    return () => {
      const styleToRemove = document.querySelector('style[data-fade-animation]');
      if (styleToRemove && styleToRemove.parentNode) {
        styleToRemove.parentNode.removeChild(styleToRemove);
      }
    };
  }, []);

  const calculateMaxQuantity = () => {
    if (!product.start_date || !product.end_date) return 1;
    const startDate = new Date(product.start_date);
    const endDate = new Date(product.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Añadir 1 para incluir ambos días (start y end)
    return diffDays + 1;
  }

  const maxQuantity = calculateMaxQuantity();

  const handleSumQuantity = () => {
    if (product.quantity && product.quantity >= maxQuantity) {
      return;
    }
    
    const productAux = {...product, quantity: product.quantity ? product.quantity + 1 : 1};
    onClick(productAux.attendee_id, productAux);
  }

  const handleSubtractQuantity = () => {
    const currentQuantity = product.quantity || 0;
    
    const productAux = {...product, quantity: currentQuantity - 1}
    onClick(productAux.attendee_id, productAux)
  }

  const handleMainClick = () => {
    if (!disabled && !showQuantityControls) {
      handleSumQuantity();
    }
  }

  const showQuantityControls = product.quantity && product.quantity > 0;
  const isMaxQuantityReached = product.quantity && product.quantity >= maxQuantity ? true : false;
  // Determinar si el botón de reducir cantidad debe estar deshabilitado
  const isMinQuantityReached = purchased && product.quantity && product.quantity <= (product.original_quantity ?? 1);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          onClick={handleMainClick}
          className={cn(
            'flex items-center gap-2 border border-neutral-200 rounded-md p-2 relative cursor-pointer',
            variants[ purchased ? 'purchased' : disabled ? 'disabled' : selected ? 'selected' : 'default'],
            disabled && 'cursor-not-allowed'
          )}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
        >
          <div className="flex justify-between w-full flex-wrap">
            <div className="flex md:items-center md:gap-2 flex-col md:flex-row">
              <div className="flex items-center pl-2">
                <Ticket className="w-4 h-4 hidden md:block" />
                <p className="font-semibold text-sm md:pl-3">{product.name}</p>
              </div>

            </div>

            {/* Right Side: This container will manage Price/Info and QuantityControls layout */}
            {/* On mobile: column, items aligned to end (right). On desktop: row, items centered vertically. */}
            <div className="flex flex-col items-end justify-center md:flex-row md:items-center md:gap-2">
              {/* Sub-container for Info Icon and Price to keep them in a row and allow them to be a single item in the flex-col layout for mobile */}
              <div className="flex items-center gap-2">
                {
                  product.description && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className={cn(`w-4 h-4 text-slate-500 hover:text-slate-700`, product.purchased && 'text-white hover:text-white')} />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-black shadow-md border border-gray-200 max-w-sm">
                        {product.description}
                      </TooltipContent>
                    </Tooltip>
                  )
                }
                
                {
                  !disabled && (
                    <>
                      {
                        originalPrice !== product.price && (
                          <p className={cn("text-xs text-muted-foreground line-through", disabled && 'text-neutral-300')}>
                            ${originalPrice.toLocaleString()}
                          </p>
                        )
                      }
                      <p className={cn("text-md font-medium", disabled && 'text-neutral-300')}>$ {product.price.toLocaleString()}</p>
                    </>
                  )
                }
              </div>

              {/* Container for both Desktop and Mobile QuantityControls */}
              {/* This div ensures quantity controls are treated as a distinct block for flex layout */}
              <div className={cn(!showQuantityControls && 'hidden')}>
                <div className="hidden md:block">
                  <QuantityControls product={product} handleSumQuantity={handleSumQuantity} handleSubtractQuantity={handleSubtractQuantity} disabled={disabled} isMinQuantityReached={!!isMinQuantityReached} isMaxQuantityReached={!!isMaxQuantityReached} />
                </div>
                <div className="flex justify-center md:hidden">
                  <QuantityControls product={product} handleSumQuantity={handleSumQuantity} handleSubtractQuantity={handleSubtractQuantity} disabled={disabled} isMinQuantityReached={!!isMinQuantityReached} isMaxQuantityReached={!!isMaxQuantityReached} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      {hasMonthPurchased && (
        <TooltipContent className="bg-white text-black shadow-md border border-gray-200 max-w-sm">
          You already have a monthly pass. No need to buy a day ticket.
        </TooltipContent>
      )}
    </Tooltip>
  )
}


const QuantityControls = ({product, handleSumQuantity, handleSubtractQuantity, disabled, isMinQuantityReached, isMaxQuantityReached}: {product: ProductsPass, handleSumQuantity: () => void, handleSubtractQuantity: () => void, disabled: boolean, isMinQuantityReached: boolean, isMaxQuantityReached: boolean}) => {
  const showQuantityControls = product.quantity && product.quantity > 0;
  return (
    <div className="flex items-center relative h-6 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {showQuantityControls ? ( 
        <div className="flex items-center animate-fade-in-right">
          {
            !disabled && (
              <button 
                onClick={(e) => {
                  handleSubtractQuantity();
                }} 
                className={cn(
                  "transition-all duration-300 ease-in-out transform hover:scale-110 flex items-center justify-center w-6 h-6 rounded",
                  isMinQuantityReached && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled || !!isMinQuantityReached}
                aria-label="Decrease quantity"
                tabIndex={0}
              >
                <Minus className="w-4 h-4" />
              </button>
            )
          }
          <span className="transition-all duration-300 ease-in-out w-6 text-center font-medium">
            {product.quantity || 0}
          </span>

          {
            !disabled && (
              <button
                onClick={(e) => {
                  handleSumQuantity();
                }}
                className={cn(
                  "transition-all duration-300 ease-in-out transform hover:scale-110 flex items-center justify-center w-6 h-6 rounded",
                  isMaxQuantityReached && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled || isMaxQuantityReached}
                aria-label="Increase quantity"
                tabIndex={0}
              >
                <Plus className="w-4 h-4" />
              </button>
            )
          }
        </div>
      ) : !disabled && (
        <button
          onClick={(e) => {
            handleSumQuantity();
          }}
          className="hidden transition-all duration-300 ease-in-out transform hover:scale-110 md:flex items-center justify-center w-6 h-6 rounded"
          disabled={disabled}
          aria-label="Add item"
          tabIndex={0}
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Product