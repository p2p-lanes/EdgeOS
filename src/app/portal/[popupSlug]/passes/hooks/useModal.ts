import { AttendeeCategory, AttendeeProps } from "@/types/Attendee"
import { useState } from "react"

type ModalType = {
  isOpen: boolean
  category: AttendeeCategory | null
  editingAttendee: AttendeeProps | null
}

const useModal = () => {
  const [modal, setModal] = useState<ModalType>({
    isOpen: false,
    category: null,
    editingAttendee: null
  })

  const handleOpenModal = (category: AttendeeCategory) => {
    setModal({
      isOpen: true,
      category,
      editingAttendee: null
    })
  }

  const handleCloseModal = () => {
    setModal({
      isOpen: false,
      category: null,
      editingAttendee: null
    })
  }

  const handleEdit = (attendee: AttendeeProps) => {
    setModal({
      isOpen: true,
      category: attendee.category,
      editingAttendee: attendee
    })
  }

  return ({
    modal,
    handleOpenModal,
    handleCloseModal,
    handleEdit
  })
}
export default useModal