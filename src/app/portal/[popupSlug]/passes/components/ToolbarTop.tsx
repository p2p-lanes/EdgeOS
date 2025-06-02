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
import DiscountCode from "./common/DiscountCode"
import { useCityProvider } from "@/providers/cityProvider"

interface ToolbarTopProps {
  canEdit?: boolean;
  viewInvoices?: boolean;
  positionCoupon?: 'top' | 'bottom' | 'right';
  onSwitchToBuy?: () => void;
  canAddSpouse?: boolean;
  canAddChildren?: boolean;
  allows_coupons?: boolean;
}

const ToolbarTop = ({
  canEdit = false, 
  viewInvoices = true, 
  positionCoupon = 'bottom',
  onSwitchToBuy,
  canAddSpouse = true,
  canAddChildren = true,
  allows_coupons = true
}: ToolbarTopProps) => {
  const { getAttendees } = useApplication()
  const { handleOpenModal, handleCloseModal, modal } = useModal()
  const { addAttendee } = useAttendee()
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const { getCity } = useCityProvider()
  const city = getCity()

  const attendees = getAttendees()
  const hasSpouse = attendees.some(a => a.category === 'spouse')

  // Check if current date is before city start_date
  const canEditDate = city?.start_date ? new Date() < new Date(city.start_date) : true

  const handleSubmit = async (data: AttendeeProps) => {
    if (modal.category) {
      await addAttendee({ ...data })
    }
    handleCloseModal()
  }


  return (
    <div className="flex justify-between w-full flex-wrap gap-2">
      <div className="flex gap-2 flex-wrap">
        {canAddSpouse && !hasSpouse && (
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

        {canAddChildren && (
          <Button
            variant="default"
            className="bg-white text-black hover:bg-white hover:shadow-md transition-all"
            disabled={!attendees.length}
            onClick={() => handleOpenModal('kid')}
        >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add children
          </Button>
        )}

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

      <div className="flex gap-2 items-center">
        {canEdit && canEditDate && <EditPassesButton onSwitchToBuy={onSwitchToBuy} />}
        {
          viewInvoices && (
            <>
              <Button variant={'ghost'} onClick={() => setIsInvoiceModalOpen(true)}>
                <Newspaper className="h-4 w-4" />
                <p className="text-sm font-medium hidden md:block">View Invoices</p>
              </Button>
              <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
            </>
          )
        }

        {
          positionCoupon === 'right' && allows_coupons && (
            <div className="ml-2">
              <DiscountCode defaultOpen={true} label={false}/>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default ToolbarTop