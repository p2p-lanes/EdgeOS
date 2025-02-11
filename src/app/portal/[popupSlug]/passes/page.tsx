'use client'

import { usePassesProvider } from '@/providers/passesProvider'
import BalancePasses from './components/common/BalancePasses'
import EditPassesButton from './components/common/Buttons/EditPassesButton'
import InvoicePassesButton from './components/common/Buttons/InvoicePassesButton'
import TitleTabs from './components/common/TitleTabs'
import usePermission from './hooks/usePermission'
import Ticket from './components/common/Ticket'
import CompletePurchaseButton from './components/common/Buttons/CompletePurchaseButton'
import AddAttendeeToolbar from './components/AddAttendeeToolbar'

export default function HomePasses() {
  usePermission()

  const { toggleProduct, attendeePasses: attendees } = usePassesProvider()

  return (
    <div className="w-full mx-auto max-w-3xl space-y-6">
      <TitleTabs title="Your Passes" subtitle="View and manage your passes here. Need to make changes? You can switch your week closer to the event to match your plans!" />
      
      <div className="my-4 flex justify-between">
        <BalancePasses />
        <div className="flex gap-3">
          <EditPassesButton />
          {/* <InvoicePassesButton /> */}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {
          attendees.map(attendee => (
            <Ticket key={attendee.id} attendee={attendee} toggleProduct={toggleProduct} />
          ))
        }
      </div>

      <div className="flex w-full justify-between">
        <AddAttendeeToolbar/>
        <CompletePurchaseButton />
      </div>
    </div>
  )
}

