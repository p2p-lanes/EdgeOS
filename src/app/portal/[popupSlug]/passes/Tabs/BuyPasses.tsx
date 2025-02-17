import { usePassesProvider } from "@/providers/passesProvider"
import AttendeeTicket from "../components/common/AttendeeTicket"
import CompletePurchaseButton from "../components/common/Buttons/CompletePurchaseButton"
import TitleTabs from "../components/common/TitleTabs"
import TotalPurchase from "../components/common/TotalPurchase"
import BannerDiscount from "../components/common/BannerDiscount"
import DiscountCode from "../components/common/DiscountCode"
import ToolbarTop from "../components/ToolbarTop"
import { usePasses } from "../hooks/usePasses"
import { Separator } from "@/components/ui/separator"
import Special from "../components/common/Products/Special"

const BuyPasses = () => {
  const { toggleProduct, attendeePasses: attendees, products } = usePassesProvider()
  const { specialProduct, mainAttendee, specialPurchase } = usePasses(attendees)

  return (
    <div className="space-y-6">
      <TitleTabs title="Buy Passes" subtitle="Choose your attendance weeks and get passes for you and your group." />
      
      <BannerDiscount isPatreon={false} products={products} />

      <div className="my-4 flex justify-start">
        <ToolbarTop/>
      </div>

      <div className="flex flex-col gap-4">
        {
          attendees.map(attendee => (
            <AttendeeTicket key={attendee.id} attendee={attendee} toggleProduct={toggleProduct}/>
          ))
        }
      </div>

      {(specialProduct && mainAttendee?.id) && (
        <div className="p-0 w-full">
          <Separator className="my-4"/>
          <Special
            product={specialProduct}
            onClick={() => toggleProduct(mainAttendee.id, specialProduct)}
          />
        </div>
      )}

      <DiscountCode/>

      <TotalPurchase
        attendees={attendees}
        isPatreon={false} 
        products={products}
      />

      <div className="flex w-full justify-center">
        <CompletePurchaseButton />
      </div>
    </div>
  )
}
export default BuyPasses