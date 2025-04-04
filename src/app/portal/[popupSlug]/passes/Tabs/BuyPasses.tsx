import { usePassesProvider } from "@/providers/passesProvider"
import AttendeeTicket from "../components/common/AttendeeTicket"
import CompletePurchaseButton from "../components/common/Buttons/CompletePurchaseButton"
import TitleTabs from "../components/common/TitleTabs"
import TotalPurchase from "../components/common/TotalPurchase"
import BannerDiscount from "../components/common/BannerDiscount"
import DiscountCode from "../components/common/DiscountCode"
import ToolbarTop from "../components/ToolbarTop"
import { Separator } from "@/components/ui/separator"
import Special from "../components/common/Products/Special"
import BalancePasses from "../components/common/BalancePasses"
import BottomSheet from "@/components/common/BottomSheet"
import TotalFloatingBar from "../components/common/TotalFloatingBar"
import { useState } from "react"
import { useTotal } from "@/providers/totalProvider"

const BuyPasses = ({floatingBar = true, viewInvoices = true, canEdit = true, defaultOpenDiscount = false, positionCoupon = 'bottom'}: {floatingBar?: boolean, viewInvoices?: boolean, canEdit?: boolean, defaultOpenDiscount?: boolean, positionCoupon?: 'top' | 'bottom' | 'right'}) => {
  const { toggleProduct, attendeePasses: attendees, products, isEditing } = usePassesProvider()
  const [openCart, setOpenCart] = useState<boolean>(false)
  const mainAttendee = attendees.find(a => a.category === 'main')
  const specialProduct = mainAttendee?.products.find(p => p.category === 'patreon')
  const someProductSelected = attendees.some(a => a.products.some(p => p.selected))
  const { total } = useTotal()

  return (
    <div className="space-y-6 pb-[20px] md:pb-0">
      <TitleTabs title="Buy Passes">
        <p>
          Choose your passes below and make sure to add tickets for any family members who will be joining you. You can explore more about the event's programming
           <a href="https://edgeesmeralda2025.substack.com/p/programming-philosophy-and-preview" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"> here</a>.
           Please note that tickets <span className="font-bold">do not include accommodation</span>.
        </p>
      </TitleTabs>

      <BalancePasses />

      <div className="my-4 flex justify-start">
        <ToolbarTop canEdit={canEdit} viewInvoices={viewInvoices} positionCoupon={positionCoupon}/>
      </div>

      {
        positionCoupon === 'top' && (
          <DiscountCode defaultOpen={defaultOpenDiscount}/>
        )
      }

      <BannerDiscount isPatreon={(specialProduct?.selected || specialProduct?.purchased) ?? false} products={products} />

      {(specialProduct && mainAttendee?.id) && (
        <div className="p-0 w-full">
          <Special
            disabled={isEditing}
            product={specialProduct}
            onClick={() => toggleProduct(mainAttendee.id, specialProduct)}
          />
          <Separator className="my-4"/>
        </div>
      )}


      <div className="flex flex-col gap-4">
        {
          attendees.map(attendee => (
            <AttendeeTicket key={attendee.id} attendee={attendee} toggleProduct={toggleProduct}/>
          ))
        }
      </div>

      {
        positionCoupon === 'bottom' && (
          <DiscountCode defaultOpen={defaultOpenDiscount}/>
        )
      }

      {
        !floatingBar && someProductSelected && (
          <div className="flex flex-col gap-4 w-full pointer-events-auto">
            <TotalPurchase
              attendees={attendees}
              isModal={false}
              isOpen={openCart}
              setIsOpen={setOpenCart}
            />
            <div className="flex w-full justify-center">
              <CompletePurchaseButton edit={total <= 0} />
            </div>
          </div>
        )
      }

      {/* Versión desktop con FloatingBar */}
      {someProductSelected && floatingBar && (
        <div className="hidden md:block">
          <BottomSheet className="bottom-6 pointer-events-none ">
            {(isFloating) => (
              (isFloating) ? (
                <div className="flex justify-center lg:ml-[255px]">
                  <div className="bg-white p-4 shadow-lg border border-neutral-200 rounded-lg min-w-[600px] pointer-events-auto">
                    <TotalFloatingBar setOpenCart={setOpenCart}/>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 w-full pointer-events-auto">
                  <TotalPurchase
                    attendees={attendees}
                    isModal={isFloating}
                    isOpen={openCart}
                    setIsOpen={setOpenCart}
                  />
                  <div className="flex w-full justify-center">
                    <CompletePurchaseButton edit={total <= 0} />
                  </div>
                </div>
              )
            )}
          </BottomSheet>
        </div>
      )}

      {/* Versión mobile con bottom sheet */}
      {someProductSelected && (
        <div className="block md:hidden">
          <BottomSheet>
            {(isModal) => (
              <div className={`${isModal ? 'bg-white p-4 shadow-lg border-t border-neutral-200 rounded-t-2xl' : ''}`}>
                <TotalPurchase
                  attendees={attendees}
                  isModal={isModal}
                  isOpen={openCart}
                  setIsOpen={setOpenCart}
                />
                <div className="flex w-full justify-center mt-4">
                  <CompletePurchaseButton  edit={total <= 0}/>
                </div>
              </div>
            )}
          </BottomSheet>
        </div>
      )}
    </div>
  )
}
export default BuyPasses