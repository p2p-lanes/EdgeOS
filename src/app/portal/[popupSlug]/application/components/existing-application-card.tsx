import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCityProvider } from '@/providers/cityProvider';
import { PopupsProps } from '@/types/Popup';
import { ApplicationProps } from '@/types/Application';

interface ExistingApplicationCardProps {
  onImport: () => void;
  onCancel: () => void;
  data: ApplicationProps;
}

export function ExistingApplicationCard({ onImport, onCancel, data }: ExistingApplicationCardProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { getPopups } = useCityProvider()
  const popups = getPopups()

  const handleImport = () => {
    onImport()
    setIsOpen(false)
  }

  const handleCancel = () => {
    onCancel()
    setIsOpen(false)
  }

  const popup = popups.find((popup: PopupsProps) => popup.id === data.popup_city_id)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Existing Application Found</DialogTitle>
          <DialogDescription>We've found a previous application associated with your email.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p><strong>Applicant:</strong> {data.first_name} {data.last_name}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Popup City:</strong> {popup?.name}</p>
        </div>
        <p className="mt-4">Would you like to import your previous application data? This will save you time by pre-filling the form with your existing information.</p>
        <DialogFooter className="flex flex-col gap-4 md:flex-row">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleImport}>Import Previous Application</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

