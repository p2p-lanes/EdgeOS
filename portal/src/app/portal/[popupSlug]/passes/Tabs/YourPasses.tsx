import { useSearchParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useCityProvider } from "@/providers/cityProvider"
import { usePassesProvider } from "@/providers/passesProvider"
import AttendeeTicket from "../components/common/AttendeeTicket"
import Special from "../components/common/Products/Special"
import TitleTabs from "../components/common/TitleTabs"
import ToolbarTop from "../components/ToolbarTop"

interface YourPassesProps {
  onSwitchToBuy: () => void
}

const YourPasses = ({ onSwitchToBuy }: YourPassesProps) => {
  const { attendeePasses: attendees } = usePassesProvider()
  const mainAttendee = attendees.find((a) => a.category === "main")
  const specialProduct = mainAttendee?.products.find(
    (p) => p.category === "patreon",
  )
  const searchParams = useSearchParams()
  const isDayCheckout = searchParams.has("day-passes")
  const { getCity } = useCityProvider()
  const city = getCity()

  return (
    <div className="space-y-6">
      <TitleTabs
        title="Your Passes"
        subtitle="View and manage your passes here. Need to make changes? You can switch your week closer to the event to match your plans!"
      />

      <div className="my-4 flex justify-start">
        <ToolbarTop
          canEdit={true}
          onSwitchToBuy={onSwitchToBuy}
          canAddSpouse={city?.allows_spouse ?? false}
          canAddChildren={city?.allows_children ?? false}
          allows_coupons={city?.allows_coupons ?? false}
        />
      </div>

      <div className="flex flex-col gap-4">
        {specialProduct && (
          <div className="p-0 w-full">
            <Special product={specialProduct} disabled />
            <Separator className="my-4" />
          </div>
        )}

        {attendees.length === 0 ? (
          <>
            <Skeleton className="w-full h-[300px] rounded-3xl" />
            <Skeleton className="w-full h-[300px] rounded-3xl" />
            <Skeleton className="w-full h-[300px] rounded-3xl" />
          </>
        ) : (
          attendees.map((attendee) => (
            <AttendeeTicket
              key={attendee.id}
              attendee={attendee}
              isDayCheckout={isDayCheckout}
              onSwitchToBuy={onSwitchToBuy}
            />
          ))
        )}
      </div>
    </div>
  )
}
export default YourPasses
