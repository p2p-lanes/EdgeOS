import TitleTabs from "../components/common/TitleTabs"
import { usePassesProvider } from '@/providers/passesProvider'
import AttendeeTicket from "../components/common/AttendeeTicket"
import ToolbarTop from "../components/ToolbarTop"
import { Separator } from "@/components/ui/separator"
import Special from "../components/common/Products/Special"
import { Skeleton } from "@/components/ui/skeleton"

const YourPasses = () => {
  const { attendeePasses: attendees } = usePassesProvider()
  const mainAttendee = attendees.find(a => a.category === 'main')
  const specialProduct = mainAttendee?.products.find(p => p.category === 'patreon')

  return (
    <div className="space-y-6">
      <TitleTabs title="Your Passes" subtitle="View and manage your passes here. Need to make changes? You can switch your week closer to the event to match your plans!" />
      
      <div className="my-4 flex justify-start">
        <ToolbarTop/>
      </div>

      <div className="flex flex-col gap-4">
        {attendees.length === 0 ? (
          <>
            <Skeleton className="w-full h-[300px] rounded-3xl"/>
            <Skeleton className="w-full h-[300px] rounded-3xl"/>
            <Skeleton className="w-full h-[300px] rounded-3xl"/>
          </>
        ) : (
          attendees.map(attendee => (
            <AttendeeTicket key={attendee.id} attendee={attendee}/>
          ))
        )}
      </div>

      {specialProduct && (
        <div className="p-0 w-full">
          <Separator className="my-4"/>
          <Special product={specialProduct}/>
        </div>
      )}
    </div>
  )
}
export default YourPasses