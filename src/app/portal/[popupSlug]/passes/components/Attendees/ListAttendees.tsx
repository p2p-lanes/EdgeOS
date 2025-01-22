
import { AttendeeCategory, CreateAttendee } from "@/types/Attendee"
import useAttendee from "@/hooks/useAttendee"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { AttendeeCard } from "./AttendeeCard"
import { AttendeeModal } from "./AttendeeModal"
import { useApplication } from "@/providers/applicationProvider"

const ListAttendees = () => {
  const { addAttendee, removeAttendee, loading, editAttendee } = useAttendee()
  const [open, setOpen] = useState(false)
  const [initialName, setInitialName] = useState("")
  const [initialEmail, setInitialEmail] = useState("")
  const [category, setCategory] = useState<AttendeeCategory>('spouse')
  const [isEdit, setIsEdit] = useState(false)
  const { getAttendees } = useApplication()
  const attendees = getAttendees()

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
    setIsEdit(true)
    setInitialName(attendees.find(a => a.id === id)?.name ?? "")
    setInitialEmail(attendees.find(a => a.id === id)?.email ?? "")
    setCategory(attendees.find(a => a.id === id)?.category ?? 'spouse')
    setOpen(true)
  }

  const handleModal = ({name, email}: {name: string, email: string}) => {
    const id = attendees.find(a => a.name === initialName)?.id
    if(id){
      return editAtt(id, { name, email: email, category })
    }
    return addAtt({ name, email: email, category })
  }

  const showSpouse = attendees.find(a => a.category === 'spouse')

  const handleOpen = (category: 'kid' | 'spouse') => {
    setIsEdit(false)
    setInitialName("")
    setInitialEmail("")
    setCategory(category)
    setOpen(true)
  }

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
      <div className="flex gap-2">
        {!showSpouse && (
          <Button variant="outline" onClick={() => handleOpen('spouse')}>
            <PlusIcon className="h-4 w-4" />
            Add Spouse
          </Button>
        )}

        <Button variant="outline" onClick={() => handleOpen('kid')}>
          <PlusIcon className="h-4 w-4" />
          Add Kid
        </Button>
        <AttendeeModal onAddAttendee={handleModal} open={open} setOpen={setOpen} initialName={initialName} initialEmail={initialEmail} category={category} isEdit={isEdit}/>
      </div>
    </div>
  )
}
export default ListAttendees