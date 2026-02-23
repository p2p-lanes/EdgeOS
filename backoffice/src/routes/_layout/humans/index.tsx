import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertCircle,
  EllipsisVertical,
  Eye,
  Pencil,
  Plus,
  Users,
} from "lucide-react"
import { Suspense, useState } from "react"

import { type HumanPublic, HumansService } from "@/client"
import { DataTable, SortableHeader } from "@/components/Common/DataTable"
import { EmptyState } from "@/components/Common/EmptyState"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { StatusBadge } from "@/components/Common/StatusBadge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"
import {
  useTableSearchParams,
  validateTableSearch,
} from "@/hooks/useTableSearchParams"

function getHumansQueryOptions(
  page: number,
  pageSize: number,
  search?: string,
) {
  return {
    queryFn: () =>
      HumansService.listHumans({
        skip: page * pageSize,
        limit: pageSize,
        search: search || undefined,
      }),
    queryKey: ["humans", { page, pageSize, search }],
  }
}

export const Route = createFileRoute("/_layout/humans/")({
  component: Humans,
  validateSearch: validateTableSearch,
  head: () => ({
    meta: [{ title: "Humans - EdgeOS" }],
  }),
})

function HumanActionsMenu({ human }: { human: HumanPublic }) {
  const [open, setOpen] = useState(false)
  const { isAdmin } = useAuth()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Human actions">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/humans/$id/edit" params={{ id: human.id }}>
            {isAdmin ? (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                View
              </>
            )}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns: ColumnDef<HumanPublic>[] = [
  {
    id: "name",
    header: ({ column }) => <SortableHeader label="Name" column={column} />,
    accessorFn: (row) =>
      `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
    cell: ({ row }) => {
      const firstName = row.original.first_name ?? ""
      const lastName = row.original.last_name ?? ""
      const fullName = `${firstName} ${lastName}`.trim()
      return <span className="text-muted-foreground">{fullName || "—"}</span>
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader label="Email" column={column} />,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "organization",
    header: "Organization",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.organization || "—"}
      </span>
    ),
  },
  {
    accessorKey: "red_flag",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.red_flag ? "flagged" : "active"} />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <HumanActionsMenu human={row.original} />
      </div>
    ),
  },
]

function HumansTableContent() {
  const searchParams = Route.useSearch()
  const { search, pagination, setSearch, setPagination } = useTableSearchParams(
    searchParams,
    "/humans",
  )

  const { data: humans } = useQuery({
    ...getHumansQueryOptions(pagination.pageIndex, pagination.pageSize, search),
    placeholderData: keepPreviousData,
  })

  if (!humans) return <Skeleton className="h-64 w-full" />

  return (
    <DataTable
      columns={columns}
      data={humans.results}
      searchPlaceholder="Search by name, email, or organization..."
      hiddenOnMobile={["organization", "red_flag"]}
      searchValue={search}
      onSearchChange={setSearch}
      serverPagination={{
        total: humans.paging.total,
        pagination: pagination,
        onPaginationChange: setPagination,
      }}
      emptyState={
        !search ? (
          <EmptyState
            icon={Users}
            title="No humans yet"
            description="Humans will appear here once end-users register through your popups."
          />
        ) : undefined
      }
    />
  )
}

function HumansTable() {
  return (
    <QueryErrorBoundary>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <HumansTableContent />
      </Suspense>
    </QueryErrorBoundary>
  )
}

function AddHumanButton() {
  return (
    <Button asChild>
      <Link to="/humans/new">
        <Plus className="mr-2 h-4 w-4" />
        Create Human
      </Link>
    </Button>
  )
}

function Humans() {
  const { needsTenantSelection, isContextReady } = useWorkspace()
  const { isSuperadmin } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      {needsTenantSelection && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Select a tenant</AlertTitle>
          <AlertDescription>
            Please select a tenant from the sidebar to view humans.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Humans</h1>
          <p className="text-muted-foreground">
            End-users who interact with your popups
          </p>
        </div>
        {isSuperadmin && isContextReady && <AddHumanButton />}
      </div>
      {!needsTenantSelection && <HumansTable />}
    </div>
  )
}
