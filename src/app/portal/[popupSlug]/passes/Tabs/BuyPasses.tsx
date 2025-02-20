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

const BuyPasses = () => {
  const { toggleProduct, attendeePasses: attendees, products, isEditing } = usePassesProvider()
  const mainAttendee = attendees.find(a => a.category === 'main')
  const specialProduct = mainAttendee?.products.find(p => p.category === 'patreon')
  const someProductSelected = attendees.some(a => a.products.some(p => p.selected))

  return (
    <div className="space-y-6 pb-[20px] md:pb-0">
      <TitleTabs title="Buy Passes" subtitle="Choose your attendance weeks and get passes for you and your group." />

      <BalancePasses />

      <div className="my-4 flex justify-start">
        <ToolbarTop canEdit/>
      </div>

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

      <DiscountCode/>

      <div className="hidden md:flex md:flex-col md:gap-4">
        <TotalPurchase attendees={attendees} />
        <div className="flex w-full justify-center">
          <CompletePurchaseButton />
        </div>
      </div>

      {/* Versión mobile con bottom sheet y versión integrada */}
      {
        someProductSelected && (
          <div className="block md:hidden">
            <BottomSheet>
              {(isModal) => (
                <>
                  <TotalPurchase
                    attendees={attendees}
                    isModal={isModal}
                  />
                  <div className="flex w-full justify-center mt-4">
                    <CompletePurchaseButton />
                  </div>
                </>
              )}
            </BottomSheet>
          </div>
        )
      }
    </div>
  )
}
export default BuyPasses