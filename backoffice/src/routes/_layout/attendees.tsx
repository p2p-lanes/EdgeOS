import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Download,
  EllipsisVertical,
  Eye,
  Mail,
  QrCode,
  User,
  Users,
} from "lucide-react"
import { Suspense, useState } from "react"

import { type AttendeePublic, AttendeesService } from "@/client"
import { DataTable, SortableHeader } from "@/components/Common/DataTable"
import { EmptyState } from "@/components/Common/EmptyState"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { WorkspaceAlert } from "@/components/Common/WorkspaceAlert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InlineRow, InlineSection } from "@/components/ui/inline-form"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import {
  useTableSearchParams,
  validateTableSearch,
} from "@/hooks/useTableSearchParams"
import { exportToCsv, fetchAllPages } from "@/lib/export"

function getAttendeesQueryOptions(
  popupId: string | null,
  page: number,
  pageSize: number,
) {
  return {
    queryFn: () =>
      AttendeesService.listAttendees({
        skip: page * pageSize,
        limit: pageSize,
        popupId: popupId || undefined,
      }),
    queryKey: ["attendees", popupId, { page, pageSize }],
  }
}

export const Route = createFileRoute("/_layout/attendees")({
  component: Attendees,
  validateSearch: validateTableSearch,
  head: () => ({
    meta: [{ title: "Attendees - EdgeOS" }],
  }),
})

function ViewAttendee({ attendee }: { attendee: AttendeePublic }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </DropdownMenuItem>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Attendee Details</DialogTitle>
          <DialogDescription>{attendee.name}</DialogDescription>
        </DialogHeader>

        {/* Hero */}
        <div className="space-y-1 px-6 pt-6 pb-4">
          <p className="text-2xl font-semibold">{attendee.name}</p>
          <Badge variant="secondary" className="capitalize">
            {attendee.category}
          </Badge>
        </div>

        <Separator />

        {/* Contact */}
        <InlineSection title="Contact" className="px-6 py-4">
          <InlineRow
            icon={<Mail className="h-4 w-4 text-muted-foreground" />}
            label="Email"
          >
            <span className="text-sm text-muted-foreground">
              {attendee.email || "N/A"}
            </span>
          </InlineRow>
          {attendee.gender && (
            <InlineRow
              icon={<User className="h-4 w-4 text-muted-foreground" />}
              label="Gender"
            >
              <span className="text-sm text-muted-foreground">
                {attendee.gender}
              </span>
            </InlineRow>
          )}
        </InlineSection>

        <Separator />

        {/* Check-in */}
        <InlineSection title="Check-in" className="px-6 py-4">
          <InlineRow
            icon={<QrCode className="h-4 w-4 text-muted-foreground" />}
            label="Code"
          >
            <span className="font-mono text-sm font-medium">
              {attendee.check_in_code}
            </span>
          </InlineRow>
        </InlineSection>

        {/* Products */}
        {attendee.products && attendee.products.length > 0 && (
          <>
            <Separator />
            <div className="px-6 py-4">
              <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Products
              </p>
              <div className="flex flex-wrap gap-1.5">
                {attendee.products.map((product) => {
                  const p = product as { id?: string; name?: string }
                  return (
                    <Badge key={p.id ?? String(product)} variant="secondary">
                      {p.name ?? "Unknown"}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <Separator />
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex gap-4 text-xs text-muted-foreground">
            {attendee.created_at && (
              <span>{new Date(attendee.created_at).toLocaleDateString()}</span>
            )}
            {attendee.updated_at && (
              <span>
                Updated {new Date(attendee.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AttendeeActionsMenu({ attendee }: { attendee: AttendeePublic }) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Attendee actions">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ViewAttendee attendee={attendee} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns: ColumnDef<AttendeePublic>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader label="Name" column={column} />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader label="Email" column={column} />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.email || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
  },
  {
    accessorKey: "check_in_code",
    header: "Check-in Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.check_in_code}</span>
    ),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.gender || "N/A"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <AttendeeActionsMenu attendee={row.original} />
      </div>
    ),
  },
]

function AttendeesTableContent() {
  const { selectedPopupId } = useWorkspace()
  const searchParams = Route.useSearch()
  const { search, pagination, setSearch, setPagination } = useTableSearchParams(
    searchParams,
    "/attendees",
  )

  const { data: attendees } = useQuery({
    ...getAttendeesQueryOptions(
      selectedPopupId,
      pagination.pageIndex,
      pagination.pageSize,
    ),
    placeholderData: keepPreviousData,
  })

  if (!attendees) return <Skeleton className="h-64 w-full" />

  const filtered = search
    ? attendees.results.filter((a) => {
        const term = search.toLowerCase()
        return (
          (a.name ?? "").toLowerCase().includes(term) ||
          (a.email ?? "").toLowerCase().includes(term) ||
          (a.check_in_code ?? "").toLowerCase().includes(term)
        )
      })
    : attendees.results

  return (
    <DataTable
      columns={columns}
      data={filtered}
      searchPlaceholder="Search by name, email, or check-in code..."
      hiddenOnMobile={["check_in_code", "gender", "category"]}
      searchValue={search}
      onSearchChange={setSearch}
      serverPagination={{
        total: search ? filtered.length : attendees.paging.total,
        pagination: search
          ? { pageIndex: 0, pageSize: attendees.paging.total }
          : pagination,
        onPaginationChange: setPagination,
      }}
      emptyState={
        !search ? (
          <EmptyState
            icon={Users}
            title="No attendees yet"
            description="Attendees will appear here once applications are approved and check-ins begin."
          />
        ) : undefined
      }
    />
  )
}

function Attendees() {
  const { isContextReady } = useWorkspace()
  const { selectedPopupId } = useWorkspace()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!selectedPopupId) return
    setIsExporting(true)
    try {
      const results = await fetchAllPages((skip, limit) =>
        AttendeesService.listAttendees({
          skip,
          limit,
          popupId: selectedPopupId,
        }),
      )
      exportToCsv(
        "attendees",
        results as unknown as Record<string, unknown>[],
        [
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "category", label: "Category" },
          { key: "check_in_code", label: "Check-in Code" },
          { key: "gender", label: "Gender" },
        ],
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendees</h1>
          <p className="text-muted-foreground">
            Manage event attendees and check-ins
          </p>
        </div>
        {isContextReady && (
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        )}
      </div>
      {!isContextReady ? (
        <WorkspaceAlert resource="attendees" />
      ) : (
        <QueryErrorBoundary>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <AttendeesTableContent />
          </Suspense>
        </QueryErrorBoundary>
      )}
    </div>
  )
}
