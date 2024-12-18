import { AttendeeCard } from "./AttendeeCard"
import { AttendeeModal } from "./AttendeeModal"
import { AttendeeProps, CreateAttendee } from "@/types/Attendee"
import useAttendee from "@/hooks/useAttendee"

const ListAttendees = ({attendees}: {attendees: AttendeeProps[]}) => {
  const { addAttendee, removeAttendee, loading } = useAttendee()

  const removeAtt = async (id: number) => {
    return removeAttendee(id)
  }

  const addAtt = async (attendee: CreateAttendee) => {
    return addAttendee(attendee)
  }

  const showSpouse = attendees.find(a => a.category === 'spouse')

  return (
    <div className="space-y-4 md:mt-3">
      <h2 className="text-xl font-semibold">Attendees</h2>
      {attendees.map((attendee) => {
        const hasDelete = attendee.category !== 'main' && (!attendee.products || attendee.products.length === 0)
        return(
          <AttendeeCard
            loading={loading}
            key={attendee.id}
            attendee={attendee}
            onDelete={hasDelete ? () => removeAtt(attendee.id) : undefined}
          />
        )
      })}
      <div className="space-y-2">
        {!showSpouse && (
          <AttendeeModal onAddAttendee={addAtt}/>
        )}
      </div>
    </div>
  )
}
export default ListAttendees