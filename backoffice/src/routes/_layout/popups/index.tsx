import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  AlertCircle,
  CalendarDays,
  EllipsisVertical,
  Eye,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Suspense, useState } from "react"

import { type PopupPublic, PopupsService } from "@/client"
import { DataTable, SortableHeader } from "@/components/Common/DataTable"
import { EmptyState } from "@/components/Common/EmptyState"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoadingButton } from "@/components/ui/loading-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import {
  useTableSearchParams,
  validateTableSearch,
} from "@/hooks/useTableSearchParams"
import { createErrorHandler } from "@/utils"

function getPopupsQueryOptions(
  page: number,
  pageSize: number,
  search?: string,
) {
  return {
    queryFn: () =>
      PopupsService.listPopups({
        skip: page * pageSize,
        limit: pageSize,
        search: search || undefined,
      }),
    queryKey: ["popups", { page, pageSize, search }],
  }
}

export const Route = createFileRoute("/_layout/popups/")({
  component: Popups,
  validateSearch: validateTableSearch,
  head: () => ({
    meta: [{ title: "Popups - EdgeOS" }],
  }),
})

function AddPopupButton() {
  return (
    <Button asChild>
      <Link to="/popups/new">
        <Plus className="mr-2 h-4 w-4" />
        Add Popup
      </Link>
    </Button>
  )
}

function DeletePopup({
  popup,
  onSuccess,
}: {
  popup: PopupPublic
  onSuccess: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: () => PopupsService.deletePopup({ popupId: popup.id }),
    onSuccess: () => {
      showSuccessToast("Popup deleted successfully")
      setIsOpen(false)
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["popups"] }),
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        variant="destructive"
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Popup</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{popup.name}"? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <LoadingButton
            variant="destructive"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Delete
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PopupActionsMenu({ popup }: { popup: PopupPublic }) {
  const [open, setOpen] = useState(false)
  const { isAdmin } = useAuth()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Popup actions">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/popups/$id/edit" params={{ id: popup.id }}>
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
        {isAdmin && (
          <DeletePopup popup={popup} onSuccess={() => setOpen(false)} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return format(new Date(dateStr), "MMM d, yyyy")
  } catch {
    return "—"
  }
}

const columns: ColumnDef<PopupPublic>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader label="Name" column={column} />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader label="Status" column={column} />,
    cell: ({ row }) => (
      <span className="capitalize text-muted-foreground">
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <SortableHeader label="Start Date" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.start_date)}
      </span>
    ),
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => <SortableHeader label="End Date" column={column} />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.end_date)}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PopupActionsMenu popup={row.original} />
      </div>
    ),
  },
]

function PopupsTableContent() {
  const searchParams = Route.useSearch()
  const { search, pagination, setSearch, setPagination } = useTableSearchParams(
    searchParams,
    "/popups",
  )

  const { data: popups } = useQuery({
    ...getPopupsQueryOptions(pagination.pageIndex, pagination.pageSize, search),
    placeholderData: keepPreviousData,
  })

  if (!popups) return <Skeleton className="h-64 w-full" />

  return (
    <DataTable
      columns={columns}
      data={popups.results}
      searchPlaceholder="Search by name..."
      hiddenOnMobile={["start_date", "end_date"]}
      searchValue={search}
      onSearchChange={setSearch}
      serverPagination={{
        total: popups.paging.total,
        pagination: pagination,
        onPaginationChange: setPagination,
      }}
      emptyState={
        !search ? (
          <EmptyState
            icon={CalendarDays}
            title="No popups yet"
            description="Create your first popup to start managing events."
            action={
              <Button asChild>
                <Link to="/popups/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Popup
                </Link>
              </Button>
            }
          />
        ) : undefined
      }
    />
  )
}

function PopupsTable() {
  return (
    <QueryErrorBoundary>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <PopupsTableContent />
      </Suspense>
    </QueryErrorBoundary>
  )
}

function Popups() {
  const { isAdmin, isSuperadmin } = useAuth()
  const { needsTenantSelection, effectiveTenantId } = useWorkspace()

  const canManagePopups = isAdmin && (!isSuperadmin || !!effectiveTenantId)

  return (
    <div className="flex flex-col gap-6">
      {needsTenantSelection && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Select a tenant</AlertTitle>
          <AlertDescription>
            Please select a tenant from the sidebar to view and manage popups.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Popups</h1>
          <p className="text-muted-foreground">
            Manage your popups and their configurations
          </p>
        </div>
        {canManagePopups && <AddPopupButton />}
      </div>
      {!needsTenantSelection && <PopupsTable />}
    </div>
  )
}
