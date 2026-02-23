import { useQuery } from "@tanstack/react-query"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { Calendar } from "lucide-react"
import { useEffect, useState } from "react"

import { PopupsService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import { unsavedChangesRef } from "@/hooks/useUnsavedChanges"

export function PopupSelector() {
  const {
    selectedPopupId,
    setSelectedPopupId,
    effectiveTenantId,
    needsTenantSelection,
  } = useWorkspace()
  const location = useLocation()
  const navigate = useNavigate()

  const [pendingPopupId, setPendingPopupId] = useState<string | null>(null)

  /** Derive the list path from the current URL, e.g. /products/123/edit -> /products */
  const getListPath = () =>
    location.pathname.replace(/\/[^/]+(\/edit)?$/, "") || "/"

  const handlePopupChange = (value: string) => {
    const isOnEditPage = /\/(new|edit)/.test(location.pathname)

    if (isOnEditPage && unsavedChangesRef.current) {
      setPendingPopupId(value)
      return
    }

    setSelectedPopupId(value)
    if (isOnEditPage) {
      navigate({ to: getListPath() })
    }
  }

  const confirmPopupChange = () => {
    if (pendingPopupId) {
      setSelectedPopupId(pendingPopupId)
      setPendingPopupId(null)
      navigate({ to: getListPath() })
    }
  }

  const cancelPopupChange = () => {
    setPendingPopupId(null)
  }

  // Only fetch popups when we have a tenant context
  const canFetchPopups = !needsTenantSelection && !!effectiveTenantId

  const {
    data: popups,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["popups", effectiveTenantId],
    queryFn: () => PopupsService.listPopups({ skip: 0, limit: 100 }),
    enabled: canFetchPopups,
  })

  // Auto-select first popup if none selected
  useEffect(() => {
    if (!selectedPopupId && popups?.results?.length) {
      setSelectedPopupId(popups.results[0].id)
    }
  }, [popups, selectedPopupId, setSelectedPopupId])

  // Clear popup selection if it's no longer valid
  useEffect(() => {
    if (selectedPopupId && popups?.results) {
      const stillValid = popups.results.some((p) => p.id === selectedPopupId)
      if (!stillValid && popups.results.length > 0) {
        setSelectedPopupId(popups.results[0].id)
      } else if (!stillValid) {
        setSelectedPopupId(null)
      }
    }
  }, [popups, selectedPopupId, setSelectedPopupId])

  if (needsTenantSelection) {
    return (
      <div className="py-2 text-sm text-muted-foreground">
        Select a tenant first
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Popup</Label>
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  if (!popups?.results?.length) {
    return (
      <div className="py-2 text-sm text-muted-foreground">
        {isError ? "Failed to load popups" : "No popups available"}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        Popup
      </Label>
      <Select value={selectedPopupId ?? ""} onValueChange={handlePopupChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select popup" />
        </SelectTrigger>
        <SelectContent>
          {popups.results.map((popup) => (
            <SelectItem key={popup.id} value={popup.id}>
              {popup.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog
        open={!!pendingPopupId}
        onOpenChange={(open) => !open && cancelPopupChange()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes that will be lost if you switch popups.
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelPopupChange}>
              Stay on page
            </Button>
            <Button variant="destructive" onClick={confirmPopupChange}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
