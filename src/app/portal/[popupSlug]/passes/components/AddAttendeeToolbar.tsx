import { Button } from "@/components/ui/button"
import { AttendeeCategory, AttendeeProps } from "@/types/Attendee"
import useAttendee from "@/hooks/useAttendee"
import { useApplication } from "@/providers/applicationProvider"
import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { AttendeeModal } from "./AttendeeModal"
import useModal from "../hooks/useModal"

const AddAttendeeToolbar = () => {
  const { addAttendee, editAttendee } = useAttendee()
  const { getAttendees } = useApplication()
  const { modal, handleOpenModal, handleCloseModal, handleEdit } = useModal()

  const attendees = getAttendees()
  const hasSpouse = attendees.some(a => a.category === 'spouse')

  const handleSubmit = async (data: AttendeeProps) => {
    if (modal.editingAttendee) {
      await editAttendee(modal.editingAttendee.id, data)
    } else if (modal.category) {
      await addAttendee({ ...data, category: modal.category })
    }
    handleCloseModal()
  }


  return (
    <div className="flex gap-2">
      {!hasSpouse && (
        <Button
          variant="outline"
          disabled={!attendees.length}
          onClick={() => handleOpenModal('spouse')}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Spouse
        </Button>
      )}

      <Button
        variant="outline"
        disabled={!attendees.length}
        onClick={() => handleOpenModal('kid')}
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Kid
      </Button>

      {modal.isOpen && (
        <AttendeeModal
          open={modal.isOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          category={modal.category!}
          editingAttendee={modal.editingAttendee}
        />
      )}
    </div>
  )
}

export default AddAttendeeToolbar