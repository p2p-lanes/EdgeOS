import type { ApplicationPublic, PopupPublic } from "@edgeos/api-client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCityProvider } from "@/providers/cityProvider"

interface ExistingApplicationCardProps {
  onImport: () => void
  onCancel: () => void
  data: ApplicationPublic
}

export function ExistingApplicationCard({
  onImport,
  onCancel,
  data,
}: ExistingApplicationCardProps) {
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

  const popup = popups.find((popup: PopupPublic) => popup.id === data.popup_id)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[425px] bg-white"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Existing Application Found</DialogTitle>
          <DialogDescription>
            We've found a previous application associated with your email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {/* LEGACY: first_name, last_name, email no longer in ApplicationPublic */}
          {data.human && (
            <p>
              <strong>Applicant:</strong> {data.human.first_name}{" "}
              {data.human.last_name}
            </p>
          )}
          {data.human?.email && (
            <p>
              <strong>Email:</strong> {data.human.email}
            </p>
          )}
          <p>
            <strong>Popup City:</strong> {popup?.name}
          </p>
        </div>
        <p className="mt-4">
          Would you like to import your previous application data? This will
          save you time by pre-filling the form with your existing information.
        </p>
        <DialogFooter className="flex flex-col gap-4 md:flex-row">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleImport}>Import Previous Application</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
