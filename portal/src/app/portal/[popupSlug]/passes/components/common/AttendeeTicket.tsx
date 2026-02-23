import { ChevronRight, QrCode, User } from "lucide-react"
import React, { useState } from "react"
import { EdgeLand } from "@/components/Icons/EdgeLand"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import useAttendee from "@/hooks/useAttendee"
import { cn } from "@/lib/utils"
import { useCityProvider } from "@/providers/cityProvider"
import type { AttendeePassState } from "@/types/Attendee"
import type { ProductsPass } from "@/types/Products"
import { badgeName } from "../../constants/multiuse"
import useModal from "../../hooks/useModal"
import { AttendeeModal } from "../AttendeeModal"
import OptionsMenu from "./Buttons/OptionsMenu"
import Product from "./Products/ProductTicket"
import QRcode from "./QRcode"

const getCategoryPriority = (category: string): number => {
  const normalized = category.toLowerCase()
  if (normalized === "day") return 999

  const isLocal = normalized.includes("local")
  const isWeek = normalized.includes("week")
  const isMonth = normalized.includes("month")

  if (!isLocal && isMonth) return 0
  if (!isLocal && isWeek) return 1
  if (isLocal && isMonth) return 2
  if (isLocal && isWeek) return 3
  return 4
}

const sortProductsByPriority = (a: ProductsPass, b: ProductsPass): number => {
  if (a.category === "day" && b.category !== "day") return 1
  if (a.category !== "day" && b.category === "day") return -1

  const priorityA = getCategoryPriority(a.category)
  const priorityB = getCategoryPriority(b.category)
  if (priorityA !== priorityB) return priorityA - priorityB
  return 0
}

const AttendeeTicket = ({
  attendee,
  toggleProduct,
  isDayCheckout,
  onSwitchToBuy,
}: {
  attendee: AttendeePassState
  toggleProduct?: (attendeeId: string, product: ProductsPass) => void
  isDayCheckout?: boolean
  onSwitchToBuy?: () => void
}) => {
  const standardProducts = attendee.products
    .filter(
      (product) =>
        product.category !== "patreon" &&
        (isDayCheckout ? product.category === "day" : true),
    )
    .sort(sortProductsByPriority)
  const { getCity } = useCityProvider()
  const city = getCity()
  const { handleEdit, handleCloseModal, modal, handleDelete } = useModal()
  const { removeAttendee, editAttendee } = useAttendee()
  const hasPurchased = attendee.products.some((product) => product.purchased)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

  const hasMonthPurchased = attendee.products.some(
    (product) =>
      (product.category === "month" || product.category === "local month") &&
      (product.purchased || product.selected),
  )
  // LEGACY: application.local_resident was removed from API
  const isLocalResident = false

  // Split products into Local and Common groups while preserving the original order
  const localProducts = standardProducts.filter((p) =>
    p.category.includes("local"),
  )
  const commonProducts = standardProducts.filter(
    (p) =>
      p.category === "week" || p.category === "month" || p.category === "day",
  )

  // Collapsible open states
  const defaultLocalOpen = isLocalResident ? localProducts.length > 0 : false
  const defaultCommonOpen = isLocalResident ? localProducts.length === 0 : true
  const [localOpen, setLocalOpen] = useState(defaultLocalOpen)
  const [commonOpen, setCommonOpen] = useState(defaultCommonOpen)

  const handleEditAttendee = () => {
    handleEdit(attendee)
  }

  const handleSubmit = async (data: AttendeePassState) => {
    try {
      if (modal.isDelete) {
        await removeAttendee(attendee.id ?? "")
      } else {
        await editAttendee(attendee.id ?? "", {
          name: data.name ?? "",
          email: data.email ?? "",
          category: (data.category ??
            "main") as import("@/types/Attendee").AttendeeCategory,
          gender: data.gender ?? "",
        })
      }
    } catch (_error) {
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

  const _handleCloseQrModal = () => {
    setIsQrModalOpen(false)
  }

  return (
    <div className="relative h-full w-full">
      <div className="w-full overflow-hidden">
        <div className="w-full rounded-3xl border border-gray-200 h-full xl:grid xl:grid-cols-[1fr_2px_2fr] bg-white">
          <div className="relative flex flex-col p-6 overflow-hidden h-full">
            <div
              className="absolute inset-0 z-0 rounded-3xl"
              style={{
                background: `linear-gradient(0deg, transparent, rgba(255, 255, 255, 0.8) 20%, #FFFFFF 90%), url(${city?.image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "top",
              }}
            />
            <div className="z-10 h-full flex xl:flex-col justify-between xl:justify-start xl:gap-10">
              <div className="flex flex-col justify-center xl:order-2">
                <p className="text-xl font-semibold">{attendee.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-500">
                    {(badgeName as Record<string, string>)[
                      attendee.category ?? ""
                    ] || attendee.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 xl:order-1">
                  <EdgeLand />
                  <p className="text-sm font-medium">{city?.name}</p>
                </div>
              </div>

              <OptionsMenu
                onEdit={handleEditAttendee}
                onDelete={hasPurchased ? undefined : handleRemoveAttendee}
                className="absolute top-1 right-4 xl:hidden"
              />
            </div>
          </div>

          <div className="border-r-2 border-dashed border-gray-200 self-stretch relative">
            <div className="absolute -top-[23px] -left-[23px] w-[48px] h-[46px] bg-neutral-100 rounded-3xl border border-gray-200" />
            <div className="absolute max-xl:-top-[23px] max-xl:-right-[23px] xl:-bottom-[23px] xl:-right-auto xl:-left-[23px] w-[48px] h-[46px] bg-neutral-100 rounded-3xl border border-gray-200" />
          </div>

          <div className="flex flex-col p-8 gap-2 xl:pr-10">
            {standardProducts.length === 0 ? (
              <div className="flex w-full h-full justify-center items-center">
                <p className="text-sm font-medium text-neutral-500">
                  Coming soon.
                </p>
              </div>
            ) : !toggleProduct && !hasPurchased ? (
              <div className="flex w-full h-full justify-center items-center p-4">
                <p className="text-sm font-medium text-neutral-500 text-center">
                  You do not yet have any passes for {city?.name}, please go to{" "}
                  <span
                    onClick={onSwitchToBuy}
                    className="text-primary hover:underline cursor-pointer font-semibold"
                  >
                    Buy Passes
                  </span>{" "}
                  to purchase
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {localProducts.length > 0 && (
                  <Collapsible
                    open={localOpen}
                    onOpenChange={setLocalOpen}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger
                      className="w-full bg-accent rounded-md"
                      aria-label="Toggle Local Tickets"
                    >
                      <div className="flex justify-between items-center p-3">
                        <div className="flex items-center gap-2">
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              localOpen && "transform rotate-90",
                            )}
                          />
                          <span className="font-medium">Latam Citizens</span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="transition-all duration-100 ease-in-out data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                      <div className="flex flex-col gap-2">
                        {localProducts.map((product, index) => {
                          const hasDayInCommon = localProducts.some((p) =>
                            p.category.includes("day"),
                          )
                          const firstDayIndexCommon = localProducts.findIndex(
                            (p) => p.category.includes("day"),
                          )

                          return (
                            <React.Fragment
                              key={`${product.id}-${attendee.id}`}
                            >
                              {index === firstDayIndexCommon &&
                                hasDayInCommon &&
                                !isDayCheckout && (
                                  <Separator className="my-1" />
                                )}
                              <Product
                                product={product}
                                defaultDisabled={!toggleProduct}
                                hasMonthPurchased={hasMonthPurchased}
                                onClick={
                                  toggleProduct
                                    ? (attendeeId, product) =>
                                        toggleProduct(attendeeId ?? "", product)
                                    : () => {}
                                }
                              />
                              {(product.category === "month" ||
                                product.category === "local month") && (
                                <Separator className="my-1" />
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                      <p className="text-sm font-medium text-neutral-500 text-right mt-2">
                        ID Required at check-in *
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {commonProducts.length > 0 && (
                  <Collapsible
                    open={commonOpen}
                    onOpenChange={setCommonOpen}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger
                      className="w-full bg-accent rounded-md"
                      aria-label="Toggle Common Tickets"
                    >
                      <div className="flex justify-between items-center p-3">
                        <div className="flex items-center gap-2">
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              commonOpen && "transform rotate-90",
                            )}
                          />
                          <span className="font-medium">Standard</span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="transition-all duration-100 ease-in-out data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                      <div className="flex flex-col gap-2">
                        {(() => {
                          const hasDayInCommon = commonProducts.some((p) =>
                            p.category.includes("day"),
                          )
                          const firstDayIndexCommon = commonProducts.findIndex(
                            (p) => p.category.includes("day"),
                          )
                          return commonProducts.map((product, index) => (
                            <React.Fragment
                              key={`${product.id}-${attendee.id}`}
                            >
                              {index === firstDayIndexCommon &&
                                hasDayInCommon &&
                                !isDayCheckout && (
                                  <Separator className="my-1" />
                                )}
                              <Product
                                product={product}
                                defaultDisabled={!toggleProduct}
                                hasMonthPurchased={hasMonthPurchased}
                                onClick={
                                  toggleProduct
                                    ? (attendeeId, product) =>
                                        toggleProduct(attendeeId ?? "", product)
                                    : () => {}
                                }
                              />
                              {(product.category === "month" ||
                                product.category === "local month") && (
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

            {!hasPurchased && (
              <OptionsMenu
                onEdit={handleEditAttendee}
                onDelete={handleRemoveAttendee}
                className="absolute top-2 right-3 hidden xl:flex"
              />
            )}

            {hasPurchased && (
              <div className="flex w-full justify-end">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 p-2"
                  onClick={handleOpenQrModal}
                  aria-label="Show check-in code"
                >
                  <p className="text-sm font-medium">Check-in Code</p>
                  <QrCode className="w-5 h-5" />
                </Button>
              </div>
            )}
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

      <QRcode
        check_in_code={attendee.check_in_code || ""}
        isOpen={isQrModalOpen}
        onOpenChange={setIsQrModalOpen}
      />
    </div>
  )
}

export default AttendeeTicket
