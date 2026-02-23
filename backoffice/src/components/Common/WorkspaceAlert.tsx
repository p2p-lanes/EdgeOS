import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WorkspaceAlertProps {
  /** The resource type being accessed (e.g., "product", "coupon", "group") */
  resource: string
  /** The action being performed - determines the message wording */
  action?: "view" | "create"
}

/**
 * Alert shown when a popup hasn't been selected from the workspace selector.
 * Used consistently across list pages and create forms.
 */
export function WorkspaceAlert({
  resource,
  action = "view",
}: WorkspaceAlertProps) {
  const message =
    action === "create"
      ? `Please select a popup from the sidebar before creating a ${resource}.`
      : `Please select a popup from the sidebar to view ${resource}.`

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Select a popup</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
