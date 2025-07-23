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
    console.log('[useModal] handleOpenModal called for category:', category)
    setModal({
      isOpen: true,
      category,
      editingAttendee: null
    })
    console.log('[useModal] Modal opened')
  }

  const handleCloseModal = () => {
    console.log('[useModal] handleCloseModal called')
    console.log('[useModal] Current modal state before close:', modal)
    setModal({
      isOpen: false,
      category: null,
      editingAttendee: null
    })
    console.log('[useModal] Modal state reset to closed')
  }

  const handleEdit = (attendee: AttendeeProps) => {
    console.log('[useModal] handleEdit called for attendee:', attendee.id, attendee.name)
    setModal({
      isOpen: true,
      category: attendee.category,
      editingAttendee: attendee
    })
    console.log('[useModal] Edit modal opened')
  }

  const handleDelete = (attendee: AttendeeProps) => {
    console.log('[useModal] handleDelete called for attendee:', attendee.id, attendee.name)
    setModal({
      isOpen: true,
      category: attendee.category,
      editingAttendee: attendee,
      isDelete: true
    })
    console.log('[useModal] Delete modal opened')
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