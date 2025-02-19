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

const BuyPasses = () => {
  const { toggleProduct, attendeePasses: attendees, products } = usePassesProvider()
  const mainAttendee = attendees.find(a => a.category === 'main')
  const specialProduct = mainAttendee?.products.find(p => p.category === 'patreon')

  return (
    <div className="space-y-6">
      <TitleTabs title="Buy Passes" subtitle="Choose your attendance weeks and get passes for you and your group." />
      
      <BannerDiscount isPatreon={false} products={products} />

      <BalancePasses />

      <div className="my-4 flex justify-start">
        <ToolbarTop canEdit/>
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