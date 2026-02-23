import { Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"

interface DangerZoneProps {
  title?: string
  description: string
  onDelete: () => void
  isDeleting: boolean
  confirmText?: string
  resourceName: string
  variant?: "card" | "inline"
}

export function DangerZone({
  description,
  onDelete,
  isDeleting,
  confirmText = "Delete",
  resourceName,
  variant = "card",
}: DangerZoneProps) {
  const [isOpen, setIsOpen] = useState(false)

  const trigger = (
    <Button
      variant="destructive"
      size="sm"
      className="shrink-0"
      onClick={() => setIsOpen(true)}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {confirmText}
    </Button>
  )

  const dialog = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{resourceName}"? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <LoadingButton
            variant="destructive"
            loading={isDeleting}
            onClick={() => {
              onDelete()
            }}
          >
            Delete
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (variant === "inline") {
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-destructive">
          Danger Zone
        </h3>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          {dialog}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-destructive p-4">
      <p className="text-sm text-muted-foreground">{description}</p>
      {dialog}
    </div>
  )
}
