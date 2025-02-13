import TitleTabs from "../components/common/TitleTabs"
import { usePassesProvider } from '@/providers/passesProvider'
import AddAttendeeToolbar from "../components/AddAttendeeToolbar"
import CompletePurchaseButton from "../components/common/Buttons/CompletePurchaseButton"
import AttendeeTicket from "../components/common/AttendeeTicket"

const YourPasses = () => {
  const { attendeePasses: attendees } = usePassesProvider()

  return (
    <div className="space-y-6">
      <TitleTabs title="Your Passes" subtitle="View and manage your passes here. Need to make changes? You can switch your week closer to the event to match your plans!" />
      
      <div className="my-4 flex justify-start">
        <AddAttendeeToolbar/>
      </div>

      <div className="flex flex-col gap-4">
        {
          attendees.map(attendee => (
            <AttendeeTicket key={attendee.id} attendee={attendee}/>
          ))
        }
      </div>
    </div>
  )
}
export default YourPasses