import { AttendeeCard } from "./AttendeeCard"
import { AttendeeModal } from "./AttendeeModal"
import { AttendeeProps, CreateAttendee } from "@/types/Attendee"
import useAttendee from "@/hooks/useAttendee"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const ListAttendees = ({attendees}: {attendees: AttendeeProps[]}) => {
  const { addAttendee, removeAttendee, loading, editAttendee } = useAttendee()
  const [open, setOpen] = useState(false)
  const [initialName, setInitialName] = useState("")
  const [initialEmail, setInitialEmail] = useState("")

  const removeAtt = async (id: number) => {
    return removeAttendee(id)
  }

  const addAtt = async (attendee: CreateAttendee) => {
    return addAttendee(attendee)
  }

  const editAtt = async (id: number, attendee: CreateAttendee) => {
    setOpen(true)
    return editAttendee(id, attendee)
  }

  const onClickEdit = (id: number) => {
    setInitialName(attendees.find(a => a.id === id)?.name ?? "")
    setInitialEmail(attendees.find(a => a.id === id)?.email ?? "")
    setOpen(true)
  }

  const handleModal = ({name, email}: {name: string, email: string}) => {
    const id = attendees.find(a => a.name === initialName)?.id
    console.log('name, email', name, email)
    if(id){
      return editAtt(id, {name, email, category: 'spouse'})
    }
    return addAtt({name, email, category: 'spouse'})
  }

  const showSpouse = attendees.find(a => a.category === 'spouse')

  return (
    <div className="space-y-4 md:mt-3">
      <h2 className="text-xl font-semibold">Attendees</h2>
      {attendees.map((attendee) => {
        const hasDelete = attendee.category !== 'main' && (!attendee.products || attendee.products.length === 0)
        const hasEdit = attendee.category !== 'main'
        return(
          <AttendeeCard
            loading={loading}
            key={attendee.id}
            attendee={attendee}
            onClickEdit={hasEdit ? () => onClickEdit(attendee.id) : undefined}
            onDelete={hasDelete ? () => removeAtt(attendee.id) : undefined}
          />
        )
      })}
      <div className="space-y-2">
        {!showSpouse && (
            <Button variant="outline" className="" onClick={() => setOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Spouse
          </Button>
        )}
        <AttendeeModal onAddAttendee={handleModal} open={open} setOpen={setOpen} initialName={initialName} initialEmail={initialEmail}/>
      </div>
    </div>
  )
}
export default ListAttendees