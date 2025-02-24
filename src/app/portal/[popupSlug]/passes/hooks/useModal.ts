import { AttendeeCategory, AttendeeProps } from "@/types/Attendee"
import { useState } from "react"

type ModalType = {
  isOpen: boolean
  category: AttendeeCategory | null
  editingAttendee: AttendeeProps | null
  isDelete?: boolean
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

  const handleDelete = (attendee: AttendeeProps) => {
    setModal({
      isOpen: true,
      category: attendee.category,
      editingAttendee: attendee,
      isDelete: true
    })
  }

  return ({
    modal,
    handleOpenModal,
    handleCloseModal,
    handleEdit,
    handleDelete
  })
}
export default useModal