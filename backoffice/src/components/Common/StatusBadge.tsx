import { Badge } from "@/components/ui/badge"

type StatusVariant = "default" | "secondary" | "destructive" | "outline"

const statusMap: Record<string, { variant: StatusVariant; label?: string }> = {
  accepted: { variant: "default" },
  approved: { variant: "default" },
  active: { variant: "default" },
  "in review": { variant: "secondary" },
  pending: { variant: "secondary" },
  inactive: { variant: "secondary" },
  draft: { variant: "outline" },
  withdrawn: { variant: "outline" },
  rejected: { variant: "destructive" },
  expired: { variant: "destructive" },
  cancelled: { variant: "destructive" },
  flagged: { variant: "destructive" },
  deleted: { variant: "destructive" },
  ambassador: { variant: "default" },
  regular: { variant: "outline" },
  strong_yes: { variant: "default", label: "Strong Yes" },
  yes: { variant: "default", label: "Yes" },
  no: { variant: "destructive", label: "No" },
  strong_no: { variant: "destructive", label: "Strong No" },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase()
  const config = statusMap[normalized] ?? {
    variant: "outline" as StatusVariant,
  }
  const label = config.label ?? status

  return (
    <Badge variant={config.variant} className={className}>
      {label}
    </Badge>
  )
}

export function getStatusVariant(status: string): StatusVariant {
  const normalized = status.toLowerCase()
  return statusMap[normalized]?.variant ?? "outline"
}
