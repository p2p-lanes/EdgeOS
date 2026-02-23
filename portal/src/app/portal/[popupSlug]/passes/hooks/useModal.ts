import { useState } from "react"
import type { AttendeeCategory, AttendeePassState } from "@/types/Attendee"

type ModalType = {
  isOpen: boolean
  category: AttendeeCategory | null
  editingAttendee: AttendeePassState | null
  isDelete?: boolean
}

const useModal = () => {
  const [modal, setModal] = useState<ModalType>({
    isOpen: false,
    category: null,
    editingAttendee: null,
  })

  const handleOpenModal = (category: AttendeeCategory) => {
    setModal({
      isOpen: true,
      category,
      editingAttendee: null,
    })
  }

  const handleCloseModal = () => {
    setModal({
      isOpen: false,
      category: null,
      editingAttendee: null,
    })
  }

  const handleEdit = (attendee: AttendeePassState) => {
    setModal({
      isOpen: true,
      category: attendee.category as AttendeeCategory,
      editingAttendee: attendee,
    })
  }

  const handleDelete = (attendee: AttendeePassState) => {
    setModal({
      isOpen: true,
      category: attendee.category as AttendeeCategory,
      editingAttendee: attendee,
      isDelete: true,
    })
  }

  return {
    modal,
    handleOpenModal,
    handleCloseModal,
    handleEdit,
    handleDelete,
  }
}
export default useModal
