import { AttendeeProps } from "@/types/Attendee"
import { Pencil, QrCode, Trash, User } from "lucide-react"
import { badgeName } from "../../constants/multiuse"
import { ProductsPass } from "@/types/Products"
import { useCityProvider } from "@/providers/cityProvider"
import { EdgeLand } from "@/components/Icons/EdgeLand"
import Product from "./Products/ProductTicket"
import useModal from "../../hooks/useModal"
import useAttendee from "@/hooks/useAttendee"
import { AttendeeModal } from "../AttendeeModal"
import OptionsMenu from "./Buttons/OptionsMenu"
import { TooltipContent } from "@/components/ui/tooltip"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QRcode from "./QRcode"

const AttendeeTicket = ({attendee, toggleProduct, isDayCheckout}: {attendee: AttendeeProps, toggleProduct?: (attendeeId: number, product: ProductsPass) => void, isDayCheckout?: boolean  }) => {
  const standardProducts = attendee.products
    .filter((product) => product.category !== 'patreon' && product.category !== 'month' && (isDayCheckout ? product.category === 'day' : true))
    .sort((a, b) => {
      if (a.category === 'day' && b.category !== 'day') return 1;
      if (a.category !== 'day' && b.category === 'day') return -1;
      return 0;
    });
  const { getCity } = useCityProvider()
  const city = getCity()
  const { handleEdit, handleCloseModal, modal, handleDelete } = useModal()
  const { removeAttendee, editAttendee } = useAttendee()
  const hasPurchased = attendee.products.some((product) => product.purchased)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

  // Check if there are any day products
  const hasDayProducts = standardProducts.some(product => product.category === 'day');
  // Find index of first day product
  const firstDayProductIndex = standardProducts.findIndex(product => product.category === 'day');
  const hasMonthPurchased = attendee.products.some(product => product.category === 'month' && (product.purchased || product.selected))

  const handleEditAttendee = () => {
    handleEdit(attendee)
  }

  const handleSubmit = async (data: AttendeeProps) => {
    console.log('[AttendeeTicket] handleSubmit called, modal.isDelete:', modal.isDelete)
    try {
      if (modal.isDelete) {
        console.log('[AttendeeTicket] About to call removeAttendee')
        await removeAttendee(attendee.id)
        console.log('[AttendeeTicket] removeAttendee completed successfully')
      } else {
        console.log('[AttendeeTicket] About to call editAttendee')
        await editAttendee(attendee.id, data)
        console.log('[AttendeeTicket] editAttendee completed successfully')
      }
    } catch (error) {
      console.error('[AttendeeTicket] Error in attendee operation:', error)
      // El error ya se maneja en useAttendee con toast, solo aseguramos que el modal se cierre
    } finally {
      // Siempre cerrar el modal, sin importar si hubo error o no
      console.log('[AttendeeTicket] About to close modal')
      handleCloseModal()
      console.log('[AttendeeTicket] Modal closed, checking document focus')
      
      // Verificar y restaurar el focus después de cerrar el modal
      setTimeout(() => {
        console.log('[AttendeeTicket] Focus check - activeElement:', document.activeElement?.tagName, document.activeElement?.className)
        console.log('[AttendeeTicket] Document hasFocus:', document.hasFocus())
        
        // DEBUGGING: Verificar si hay overlays fantasma en el DOM
        const overlays = document.querySelectorAll('[data-radix-dialog-overlay]')
        console.log('[AttendeeTicket] Dialog overlays found in DOM:', overlays.length)
        overlays.forEach((overlay, index) => {
          const htmlElement = overlay as HTMLElement
          console.log(`[AttendeeTicket] Overlay ${index}:`, overlay.getAttribute('data-state'), htmlElement.style.display)
          // Forzar eliminación de overlays fantasma
          if (overlay.getAttribute('data-state') === 'closed' || htmlElement.style.display === 'none') {
            console.log(`[AttendeeTicket] Removing ghost overlay ${index}`)
            overlay.remove()
          }
        })
        
        // DEBUGGING: Verificar estados de loading que podrían estar activos
        const loadingElements = document.querySelectorAll('[disabled], [aria-disabled="true"]')
        console.log('[AttendeeTicket] Disabled elements found:', loadingElements.length)
        
        const buttonsWithPointerEvents = document.querySelectorAll('button[style*="pointer-events: none"], button.pointer-events-none')
        console.log('[AttendeeTicket] Buttons with pointer-events-none:', buttonsWithPointerEvents.length)
        
        // Verificar si hay algún elemento con z-index alto que esté bloqueando
        const highZElements = document.querySelectorAll('*')
        let highestZ = 0
        let blockingElement = null
        highZElements.forEach(el => {
          const htmlEl = el as HTMLElement
          const zIndex = parseInt(window.getComputedStyle(htmlEl).zIndex)
          if (zIndex > highestZ && zIndex > 40) {
            highestZ = zIndex
            blockingElement = el
          }
        })
        console.log('[AttendeeTicket] Highest z-index element:', highestZ, blockingElement ? (blockingElement as HTMLElement).className : 'none')
        
        // Intentar devolver el focus al body si está perdido
        if (!document.hasFocus() || document.activeElement === document.body) {
          console.log('[AttendeeTicket] Attempting to restore focus')
          document.body.focus()
          document.body.click()
        }
      }, 100)
    }
  }

  const handleRemoveAttendee = () => {
    handleDelete(attendee)
  }

  const handleOpenQrModal = () => {
    setIsQrModalOpen(true)
  }

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false)
  }

  // Debug log para verificar el estado del componente
  console.log('[AttendeeTicket] Rendering for attendee:', attendee.id, 'Modal open:', modal.isOpen, 'hasPurchased:', hasPurchased)

  return (
    <div className="relative h-full w-full">
      <div className="w-full overflow-hidden">
        <div className="w-full rounded-3xl border border-gray-200 h-full xl:grid xl:grid-cols-[1fr_2px_2fr] bg-white">

          <div className="relative flex flex-col p-6 overflow-hidden h-full">
            <div 
              className="absolute inset-0 z-0 rounded-3xl"
              style={{
                background: `linear-gradient(0deg, transparent, rgba(255, 255, 255, 0.8) 20%, #FFFFFF 90%), url(${city?.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top',
              }}
            />
            <div className="z-10 h-full flex xl:flex-col justify-between xl:justify-start xl:gap-10">
              <div className="flex flex-col justify-center xl:order-2">
                <p className="text-xl font-semibold">{attendee.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-500"/>
                  <p className="text-sm text-gray-500">{badgeName[attendee.category] || attendee.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 xl:order-1">
                  <EdgeLand/>
                  <p className="text-sm font-medium">{city?.name}</p>
                </div>
              </div>

              <OptionsMenu onEdit={handleEditAttendee} onDelete={hasPurchased ? undefined : handleRemoveAttendee} className="absolute top-1 right-4 xl:hidden"/>
            </div>

          </div>

          <div className="border-r-2 border-dashed border-gray-200 self-stretch relative">
            <div className="absolute -top-[23px] -left-[23px] w-[48px] h-[46px] bg-neutral-100 rounded-3xl border border-gray-200"></div>
            <div className="absolute max-xl:-top-[23px] max-xl:-right-[23px] xl:-bottom-[23px] xl:-right-auto xl:-left-[23px] w-[48px] h-[46px] bg-neutral-100 rounded-3xl border border-gray-200"></div> 
          </div>

          <div className="flex flex-col p-8 gap-2 xl:pr-10">
            {
              standardProducts.length === 0 && (
                <div className="flex w-full h-full justify-center items-center">
                  <p className="text-sm font-medium text-neutral-500">Coming soon.</p>
                </div>
              )
            }
            {
              standardProducts.map((product, index) => (
                <React.Fragment key={`${product.id}-${attendee.id}`}>
                  {/* Add separator before the first day product */}
                  {index === firstDayProductIndex && hasDayProducts && !isDayCheckout && (
                    <Separator className="my-1" />
                  )}
                  <Product 
                    product={product} 
                    defaultDisabled={!toggleProduct} 
                    hasMonthPurchased={hasMonthPurchased}
                    onClick={toggleProduct ? (attendeeId, product) => toggleProduct(attendeeId ?? 0, product) : () => {}}
                  />
                </React.Fragment>
              ))
            }
            {
              !hasPurchased && (
                <OptionsMenu onEdit={handleEditAttendee} onDelete={handleRemoveAttendee} className="absolute top-2 right-3 hidden xl:flex"/>
              )
            }


            {
              hasPurchased && (
                <div className="flex w-full justify-end">
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 p-2" 
                    onClick={handleOpenQrModal}
                    aria-label="Show check-in code"
                  >
                    <p className="text-sm font-medium">Check-in Code</p>
                    <QrCode className="w-5 h-5"/>
                  </Button>
                </div>
              )
            }
          </div>
        </div>
      </div>

      {(modal.isOpen) && (
        <AttendeeModal
          open={modal.isOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          category={modal.category!}
          editingAttendee={modal.editingAttendee}
          isDelete={modal.isDelete}
        />
      )}

      <QRcode check_in_code={attendee.check_in_code || ""} isOpen={isQrModalOpen} onOpenChange={setIsQrModalOpen}/>
    </div>
  )
}

export default AttendeeTicket