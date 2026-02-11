import { usePassesProvider } from '@/providers/passesProvider'
import AttendeeTicket from "./common/AttendeeTicket"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"
import { useCityProvider } from "@/providers/cityProvider"
import { useApplication } from "@/providers/applicationProvider"
import useModal from "../hooks/useModal"
import useAttendee from "@/hooks/useAttendee"
import { AttendeeModal } from "./AttendeeModal"
import InvoiceModal from "./common/InvoiceModal"
import { useState } from "react"
import { Ticket, Plus, FileText, Sparkles, ArrowRight } from "lucide-react"
import { AttendeeProps } from "@/types/Attendee"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
interface YourPassesProps {
  onSwitchToBuy: () => void;
}

const YourPasses = ({ onSwitchToBuy }: YourPassesProps) => {
  const { attendeePasses: attendees } = usePassesProvider()
  const searchParams = useSearchParams();
  const isDayCheckout = searchParams.has("day-passes");
  const { getCity } = useCityProvider()
  const city = getCity()
  const { getAttendees } = useApplication()
  const applicationAttendees = getAttendees()
  const hasSpouse = applicationAttendees.some(a => a.category === 'spouse')
  const { handleOpenModal, handleCloseModal, modal } = useModal()
  const { addAttendee } = useAttendee()
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  // Check if any attendee has purchased passes
  const hasPurchasedPasses = attendees.some(a => a.products.some(p => p.purchased))

  const handleSubmit = async (data: AttendeeProps) => {
    if (modal.category) {
      await addAttendee({ ...data })
    }
    handleCloseModal()
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      {/* Heading with Ticket Icon */}
      <div className="flex flex-col gap-2 max-w-3xl">
        <div className="flex items-center gap-3">
          <Ticket className="w-6 h-6 text-gray-700" />
          <h1 className="text-3xl font-bold tracking-tight">Your Passes</h1>
        </div>
        <p className="text-muted-foreground/75">
          View and manage your passes here. Need to make changes? You can switch your week closer to the event to match your plans!
        </p>

        {/* Inline Text Links */}
        <div className="flex flex-wrap items-center gap-3 text-sm mt-2">
          {city?.allows_spouse && (
            <>
              <button
                className={cn(
                  "flex items-center gap-1.5 transition-colors whitespace-nowrap group",
                  hasSpouse
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:text-gray-900"
                )}
                onClick={() => !hasSpouse && handleOpenModal('spouse')}
                disabled={!applicationAttendees.length || hasSpouse}
              >
                <div className={cn(
                  "p-0.5 rounded-full transition-colors",
                  hasSpouse ? "bg-gray-100" : "bg-gray-100 group-hover:bg-gray-200"
                )}>
                  <Plus className="w-3 h-3" />
                </div>
                <span>Add spouse</span>
              </button>
              <span className="text-gray-300">|</span>
            </>
          )}
          {city?.allows_children && (
            <>
              <button
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap group"
                onClick={() => handleOpenModal('kid')}
                disabled={!applicationAttendees.length}
              >
                <div className="bg-gray-100 p-0.5 rounded-full group-hover:bg-gray-200 transition-colors">
                  <Plus className="w-3 h-3" />
                </div>
                <span>Add children</span>
              </button>
              <span className="text-gray-300">|</span>
            </>
          )}
          <button
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
            onClick={() => setIsInvoiceModalOpen(true)}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View invoices</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {attendees.length === 0 ? (
          <>
            <Skeleton className="w-full h-[300px] rounded-3xl"/>
            <Skeleton className="w-full h-[300px] rounded-3xl"/>
            <Skeleton className="w-full h-[300px] rounded-3xl"/>
          </>
        ) : (
          attendees.map(attendee => (
            <AttendeeTicket key={attendee.id} attendee={attendee} isDayCheckout={isDayCheckout} onSwitchToBuy={onSwitchToBuy}/>
          ))
        )}
      </div>

      {/* Desktop CTA Card */}
      <div className="hidden lg:block mt-6">
        {!hasPurchasedPasses ? (
          /* Empty state: Dark prominent card */
          <div
            className="rounded-3xl overflow-hidden shadow-xl relative"
            style={{
              boxShadow: '0 15px 40px -12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              className="absolute inset-0 z-0"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.97) 0%, rgba(31, 41, 55, 0.95) 100%)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10" />

            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between gap-5">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs text-white/90 font-medium">
                      500+ builders registered
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-2xl">
                    Your adventure awaits
                  </h3>
                  <p className="text-gray-300 text-sm mt-1 max-w-md">
                    Join the most innovative minds for 4 weeks of building, learning, and connecting.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    onClick={onSwitchToBuy}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 h-auto rounded-xl text-base font-bold transition-all shadow-xl whitespace-nowrap active:scale-95"
                  >
                    Get Your Pass
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <p className="text-center text-gray-400 text-xs">
                    Starting at $850
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Purchased state: Simple white card */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">Need more passes?</p>
                <p className="text-gray-500 text-xs mt-0.5">Add family members or more weeks</p>
              </div>
              <Button
                onClick={onSwitchToBuy}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap active:scale-95"
              >
                Buy Passes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        {!hasPurchasedPasses ? (
          /* Empty state: Dark background */
          <div className="bg-gray-900 border-t border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-gray-400 font-medium">500+ builders registered</span>
                </div>
                <p className="text-white font-semibold text-sm">Your adventure awaits</p>
              </div>
              <Button
                onClick={onSwitchToBuy}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg whitespace-nowrap active:scale-95"
              >
                Buy
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* Purchased state: White background */
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm">Need more passes?</p>
                <p className="text-gray-500 text-xs mt-0.5">Add family members or more weeks</p>
              </div>
              <Button
                onClick={onSwitchToBuy}
                className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg whitespace-nowrap active:scale-95"
              >
                Buy
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal.isOpen && (
        <AttendeeModal
          open={modal.isOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          category={modal.category!}
          editingAttendee={modal.editingAttendee}
        />
      )}
      <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
    </div>
  )
}
export default YourPasses