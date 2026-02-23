import type { ColumnDef } from "@tanstack/react-table"

import type { UserPublic, UserRole } from "@/client"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserActionsMenu } from "./UserActionsMenu"

export type UserTableData = UserPublic & {
  isCurrentUser: boolean
}

const getRoleBadgeVariant = (
  role: UserRole,
): "default" | "secondary" | "outline" => {
  switch (role) {
    case "superadmin":
      return "default"
    case "admin":
      return "secondary"
    case "viewer":
      return "outline"
    default:
      return "outline"
  }
}

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "superadmin":
      return "Superadmin"
    case "admin":
      return "Admin"
    case "viewer":
      return "Viewer"
    default:
      return role
  }
}

export const columns: ColumnDef<UserTableData>[] = [
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => {
      const fullName = row.original.full_name
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn("font-medium", !fullName && "text-muted-foreground")}
          >
            {fullName || "N/A"}
          </span>
          {row.original.isCurrentUser && (
            <Badge variant="outline" className="text-xs">
              You
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={getRoleBadgeVariant(row.original.role)}>
        {getRoleLabel(row.original.role)}
      </Badge>
    ),
  },

  {
    accessorKey: "deleted",
    header: "Status",
    cell: ({ row }) => {
      const isDeleted = row.original.deleted
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              isDeleted ? "bg-gray-400" : "bg-green-500",
            )}
          />
          <span className={isDeleted ? "text-muted-foreground" : ""}>
            {isDeleted ? "Deleted" : "Active"}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UserActionsMenu user={row.original} />
      </div>
    ),
  },
]
