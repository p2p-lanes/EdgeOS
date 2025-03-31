import { Button } from "@/components/ui/button"
import { AttendeeProps } from "@/types/Attendee"
import useAttendee from "@/hooks/useAttendee"
import { useApplication } from "@/providers/applicationProvider"
import { Newspaper, PlusIcon } from "lucide-react"
import useModal from "../hooks/useModal"
import { AttendeeModal } from "./AttendeeModal"
import InvoiceModal from "./common/InvoiceModal"
import { useState } from "react"
import EditPassesButton from "./common/Buttons/EditPassesButton"

const ToolbarTop = ({canEdit = false, viewInvoices = true}: {canEdit?: boolean, viewInvoices?: boolean}) => {
  const { getAttendees } = useApplication()
  const { handleOpenModal, handleCloseModal, modal } = useModal()
  const { addAttendee } = useAttendee()
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  const attendees = getAttendees()
  const hasSpouse = attendees.some(a => a.category === 'spouse')

  const handleSubmit = async (data: AttendeeProps) => {
    if (modal.category) {
      await addAttendee({ ...data })
    }
    handleCloseModal()
  }


  return (
    <div className="flex justify-between w-full flex-wrap gap-2">
      <div className="flex gap-2">
        {!hasSpouse && (
          <Button
            variant="outline"
            className="bg-white text-black hover:bg-white hover:shadow-md transition-all"
            disabled={!attendees.length}
            onClick={() => handleOpenModal('spouse')}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add spouse
          </Button>
        )}

        <Button
          variant="default"
          className="bg-white text-black hover:bg-white hover:shadow-md transition-all"
          disabled={!attendees.length}
          onClick={() => handleOpenModal('kid')}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add children
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

      {
        viewInvoices && (
          <>
            <div className="flex gap-2">
              {canEdit && <EditPassesButton/>}
              <Button variant={'ghost'} onClick={() => setIsInvoiceModalOpen(true)}>
                <Newspaper className="h-4 w-4" />
                <p className="text-sm font-medium hidden md:block">View Invoices</p>
              </Button>
            </div>

            <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
          </>
        )
      }

    </div>
  )
}

export default ToolbarTop