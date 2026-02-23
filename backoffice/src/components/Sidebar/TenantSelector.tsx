import { useQuery } from "@tanstack/react-query"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { Building2 } from "lucide-react"
import { useState } from "react"

import { TenantsService } from "@/client"
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

export function TenantSelector() {
  const { selectedTenantId, setSelectedTenantId } = useWorkspace()
  const location = useLocation()
  const navigate = useNavigate()

  const [pendingTenantId, setPendingTenantId] = useState<string | null>(null)

  /** Derive the list path from the current URL, e.g. /products/123/edit -> /products */
  const getListPath = () =>
    location.pathname.replace(/\/[^/]+(\/edit)?$/, "") || "/"

  const handleTenantChange = (value: string) => {
    const isOnEditPage = /\/(new|edit)/.test(location.pathname)

    if (isOnEditPage && unsavedChangesRef.current) {
      setPendingTenantId(value)
      return
    }

    setSelectedTenantId(value)
    if (isOnEditPage) {
      navigate({ to: getListPath() })
    }
  }

  const confirmTenantChange = () => {
    if (pendingTenantId) {
      setSelectedTenantId(pendingTenantId)
      setPendingTenantId(null)
      navigate({ to: getListPath() })
    }
  }

  const cancelTenantChange = () => {
    setPendingTenantId(null)
  }

  const {
    data: tenants,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => TenantsService.listTenants({ skip: 0, limit: 100 }),
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Tenant</Label>
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  if (!tenants?.results?.length) {
    return (
      <div className="py-2 text-sm text-muted-foreground">
        {isError ? "Failed to load tenants" : "No tenants available"}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        <Building2 className="h-3 w-3" />
        Tenant
      </Label>
      <Select value={selectedTenantId ?? ""} onValueChange={handleTenantChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select tenant" />
        </SelectTrigger>
        <SelectContent>
          {tenants.results.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog
        open={!!pendingTenantId}
        onOpenChange={(open) => !open && cancelTenantChange()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes that will be lost if you switch tenants.
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelTenantChange}>
              Stay on page
            </Button>
            <Button variant="destructive" onClick={confirmTenantChange}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
