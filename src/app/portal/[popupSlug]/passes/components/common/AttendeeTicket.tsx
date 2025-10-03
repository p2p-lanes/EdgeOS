import { AttendeeProps } from "@/types/Attendee"
import { ChevronRight, QrCode, User } from "lucide-react"
import { badgeName } from "../../constants/multiuse"
import { ProductsPass } from "@/types/Products"
import { useCityProvider } from "@/providers/cityProvider"
import { EdgeLand } from "@/components/Icons/EdgeLand"
import Product from "./Products/ProductTicket"
import useModal from "../../hooks/useModal"
import useAttendee from "@/hooks/useAttendee"
import { AttendeeModal } from "../AttendeeModal"
import OptionsMenu from "./Buttons/OptionsMenu"
import { Separator } from "@/components/ui/separator"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import QRcode from "./QRcode"
import { useApplication } from "@/providers/applicationProvider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

const getCategoryPriority = (category: string): number => {
  const normalized = category.toLowerCase()
  if (normalized === 'day') return 999

  const isLocal = normalized.includes('local')
  const isWeek = normalized.includes('week')
  const isMonth = normalized.includes('month')

  if (!isLocal && isMonth) return 0
  if (!isLocal && isWeek) return 1
  if (isLocal && isMonth) return 2
  if (isLocal && isWeek) return 3
  return 4
}

const sortProductsByPriority = (a: ProductsPass, b: ProductsPass): number => {
  if (a.category === 'day' && b.category !== 'day') return 1
  if (a.category !== 'day' && b.category === 'day') return -1

  const priorityA = getCategoryPriority(a.category)
  const priorityB = getCategoryPriority(b.category)
  if (priorityA !== priorityB) return priorityA - priorityB
  return 0
}

const AttendeeTicket = ({attendee, toggleProduct, isDayCheckout}: {attendee: AttendeeProps, toggleProduct?: (attendeeId: number, product: ProductsPass) => void, isDayCheckout?: boolean  }) => {
  const standardProducts = attendee.products
    .filter((product) => product.category !== 'patreon' && (isDayCheckout ? product.category === 'day' : true))
    .sort(sortProductsByPriority);
  const { getCity } = useCityProvider()
  const city = getCity()
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const { handleEdit, handleCloseModal, modal, handleDelete } = useModal()
  const { removeAttendee, editAttendee } = useAttendee()
  const hasPurchased = attendee.products.some((product) => product.purchased)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

  const hasDayProducts = standardProducts.some(product => product.category === 'day');
  const firstDayProductIndex = standardProducts.findIndex(product => product.category === 'day');
  const hasMonthPurchased = attendee.products.some(product => (product.category === 'month' || product.category === 'local month') && (product.purchased || product.selected))
  const isLocalResident = application?.local_resident

  // Split products into Local and Common groups while preserving the original order
  const localProducts = standardProducts.filter(p => p.category === 'local week' || p.category === 'local month')
  const commonProducts = standardProducts.filter(p => p.category === 'week' || p.category === 'month' || p.category === 'day')

  // Collapsible open states
  const defaultLocalOpen = isLocalResident ? localProducts.length > 0 : false
  const defaultCommonOpen = isLocalResident ? localProducts.length === 0 : true
  const [localOpen, setLocalOpen] = useState(defaultLocalOpen)
  const [commonOpen, setCommonOpen] = useState(defaultCommonOpen)

  const handleEditAttendee = () => {
    handleEdit(attendee)
  }

  const handleSubmit = async (data: AttendeeProps) => {
    try {
      if (modal.isDelete) {
        await removeAttendee(attendee.id)
      } else {
        await editAttendee(attendee.id, data)
      }
    } catch (error) {
      // El error ya se maneja en useAttendee con toast, solo aseguramos que el modal se cierre
    } finally {
      // Siempre cerrar el modal, sin importar si hubo error o no
      handleCloseModal()
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

  return (
    <div className="relative h-full w-full" data-testid={`attendee-ticket-container-${attendee.id}`}>
      <div className="w-full overflow-hidden">
        <div className="w-full rounded-3xl border border-gray-200 h-full xl:grid xl:grid-cols-[1fr_2px_2fr] bg-white" data-testid={`attendee-card-${attendee.id}`}>

          <div className="relative flex flex-col p-6 overflow-hidden h-full">
            <div 
              className="absolute inset-0 z-0 rounded-3xl"
              style={{
                background: `linear-gradient(0deg, transparent, rgba(255, 255, 255, 0.8) 20%, #FFFFFF 90%), url(${city?.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top',
              }}
            />
            <div className="z-10 h-full flex xl:flex-col justify-between xl:justify-start xl:gap-10" data-testid={`attendee-info-${attendee.id}`}>
              <div className="flex flex-col justify-center xl:order-2">
                <p className="text-xl font-semibold" data-testid={`attendee-name-${attendee.id}`}>{attendee.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-500"/>
                  <p className="text-sm text-gray-500" data-testid={`attendee-category-${attendee.id}`}>{badgeName[attendee.category] || attendee.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 xl:order-1" data-testid={`city-info-${attendee.id}`}>
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

          <div className="flex flex-col p-8 gap-2 xl:pr-10" data-testid={`products-section-${attendee.id}`}>
            {standardProducts.length === 0 ? (
              <div className="flex w-full h-full justify-center items-center">
                <p className="text-sm font-medium text-neutral-500" data-testid="coming-soon-message">Coming soon.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3" data-testid={`product-groups-${attendee.id}`}>
                {localProducts.length > 0 && (
                  <Collapsible open={localOpen} onOpenChange={setLocalOpen} className="space-y-2" data-testid={`local-products-${attendee.id}`}>
                    <CollapsibleTrigger className="w-full bg-accent rounded-md" aria-label="Toggle Local Tickets" data-testid={`local-products-trigger-${attendee.id}`}>
                      <div className="flex justify-between items-center p-3">
                        <div className="flex items-center gap-2">
                          <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", localOpen && "transform rotate-90")} />
                          <span className="font-medium">Latam Citizens</span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="transition-all duration-100 ease-in-out data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown" data-testid={`local-products-content-${attendee.id}`}>
                      <div className="flex flex-col gap-2">
                        {localProducts.map((product) => (
                          <React.Fragment key={`${product.id}-${attendee.id}`}>
                            <Product 
                              product={product} 
                              defaultDisabled={!toggleProduct} 
                              hasMonthPurchased={hasMonthPurchased}
                              onClick={toggleProduct ? (attendeeId, product) => toggleProduct(attendeeId ?? 0, product) : () => {}}
                              data-testid={`product-${product.id}-${attendee.id}`}
                            />
                            {(product.category === 'month' || product.category === 'local month') && (
                              <Separator className="my-1" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="text-sm font-medium text-neutral-500 text-right mt-2" data-testid="id-required-note">ID Required at check-in *</p>
                        
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {commonProducts.length > 0 && (
                  <Collapsible open={commonOpen} onOpenChange={setCommonOpen} className="space-y-2" data-testid={`common-products-${attendee.id}`}>
                    <CollapsibleTrigger className="w-full bg-accent rounded-md" aria-label="Toggle Common Tickets" data-testid={`common-products-trigger-${attendee.id}`}>
                      <div className="flex justify-between items-center p-3">
                        <div className="flex items-center gap-2">
                          <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", commonOpen && "transform rotate-90")} />
                          <span className="font-medium">Standard</span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="transition-all duration-100 ease-in-out data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown" data-testid={`common-products-content-${attendee.id}`}>
                      <div className="flex flex-col gap-2">
                        {(() => {
                          const hasDayInCommon = commonProducts.some(p => p.category === 'day')
                          const firstDayIndexCommon = commonProducts.findIndex(p => p.category === 'day')
                          return commonProducts.map((product, index) => (
                            <React.Fragment key={`${product.id}-${attendee.id}`}>
                              {index === firstDayIndexCommon && hasDayInCommon && !isDayCheckout && (
                                <Separator className="my-1" />
                              )}
                              <Product 
                                product={product} 
                                defaultDisabled={!toggleProduct} 
                                hasMonthPurchased={hasMonthPurchased}
                                onClick={toggleProduct ? (attendeeId, product) => toggleProduct(attendeeId ?? 0, product) : () => {}}
                                data-testid={`product-${product.id}-${attendee.id}`}
                              />
                              {(product.category === 'month' || product.category === 'local month') && (
                                <Separator className="my-1" />
                              )}
                            </React.Fragment>
                          ))
                        })()}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}

            {
              !hasPurchased && (
                <OptionsMenu onEdit={handleEditAttendee} onDelete={handleRemoveAttendee} className="absolute top-2 right-3 hidden xl:flex"/>
              )
            }


            {
              hasPurchased && (
                <div className="flex w-full justify-end" data-testid={`check-in-section-${attendee.id}`}>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 p-2" 
                    onClick={handleOpenQrModal}
                    aria-label="Show check-in code"
                    data-testid={`check-in-button-${attendee.id}`}
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

        <AttendeeModal
          open={modal.isOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          category={modal.category!}
          editingAttendee={modal.editingAttendee}
          isDelete={modal.isDelete}
        />

      <QRcode check_in_code={attendee.check_in_code || ""} isOpen={isQrModalOpen} onOpenChange={setIsQrModalOpen}/>
    </div>
  )
}

export default AttendeeTicket