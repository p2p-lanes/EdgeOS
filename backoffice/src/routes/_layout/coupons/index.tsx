import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisVertical, Eye, Pencil, Plus, Tag, Trash2 } from "lucide-react"
import { Suspense, useState } from "react"

import { type CouponPublic, CouponsService } from "@/client"
import { DataTable, SortableHeader } from "@/components/Common/DataTable"
import { EmptyState } from "@/components/Common/EmptyState"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { StatusBadge } from "@/components/Common/StatusBadge"
import { WorkspaceAlert } from "@/components/Common/WorkspaceAlert"
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

function getCouponsQueryOptions(
  popupId: string | null,
  page: number,
  pageSize: number,
  search?: string,
) {
  return {
    queryFn: () =>
      CouponsService.listCoupons({
        popupId: popupId ?? undefined,
        skip: page * pageSize,
        limit: pageSize,
        search: search || undefined,
      }),
    queryKey: ["coupons", { popupId, page, pageSize, search }],
  }
}

export const Route = createFileRoute("/_layout/coupons/")({
  component: Coupons,
  validateSearch: validateTableSearch,
  head: () => ({
    meta: [{ title: "Coupons - EdgeOS" }],
  }),
})

function AddCouponButton() {
  return (
    <Button asChild>
      <Link to="/coupons/new">
        <Plus className="mr-2 h-4 w-4" />
        Add Coupon
      </Link>
    </Button>
  )
}

function DeleteCoupon({
  coupon,
  onSuccess,
}: {
  coupon: CouponPublic
  onSuccess: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: () => CouponsService.deleteCoupon({ couponId: coupon.id }),
    onSuccess: () => {
      showSuccessToast("Coupon deleted successfully")
      setIsOpen(false)
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
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
          <DialogTitle>Delete Coupon</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete coupon "{coupon.code}"? This action
            cannot be undone.
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

function CouponActionsMenu({ coupon }: { coupon: CouponPublic }) {
  const [open, setOpen] = useState(false)
  const { isAdmin } = useAuth()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Coupon actions">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/coupons/$id/edit" params={{ id: coupon.id }}>
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
          <DeleteCoupon coupon={coupon} onSuccess={() => setOpen(false)} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns: ColumnDef<CouponPublic>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => <SortableHeader label="Code" column={column} />,
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "discount_value",
    header: ({ column }) => <SortableHeader label="Discount" column={column} />,
    cell: ({ row }) => <span>{row.original.discount_value}%</span>,
  },
  {
    accessorKey: "current_uses",
    header: "Uses",
    cell: ({ row }) => (
      <span>
        {row.original.current_uses}
        {row.original.max_uses ? ` / ${row.original.max_uses}` : ""}
      </span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.is_active ? "active" : "inactive"} />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CouponActionsMenu coupon={row.original} />
      </div>
    ),
  },
]

function CouponsTableContent({ popupId }: { popupId: string | null }) {
  const searchParams = Route.useSearch()
  const { search, pagination, setSearch, setPagination } = useTableSearchParams(
    searchParams,
    "/coupons",
  )

  const { data: coupons } = useQuery({
    ...getCouponsQueryOptions(
      popupId,
      pagination.pageIndex,
      pagination.pageSize,
      search,
    ),
    placeholderData: keepPreviousData,
  })

  if (!coupons) return <Skeleton className="h-64 w-full" />

  return (
    <DataTable
      columns={columns}
      data={coupons.results}
      searchPlaceholder="Search by code..."
      hiddenOnMobile={["current_uses", "is_active"]}
      searchValue={search}
      onSearchChange={setSearch}
      serverPagination={{
        total: coupons.paging.total,
        pagination: pagination,
        onPaginationChange: setPagination,
      }}
      emptyState={
        !search ? (
          <EmptyState
            icon={Tag}
            title="No coupons yet"
            description="Create discount codes to offer special pricing to your attendees."
            action={
              <Button asChild>
                <Link to="/coupons/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Coupon
                </Link>
              </Button>
            }
          />
        ) : undefined
      }
    />
  )
}

function Coupons() {
  const { isAdmin } = useAuth()
  const { selectedPopupId, isContextReady } = useWorkspace()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount codes for your popups
          </p>
        </div>
        {isAdmin && isContextReady && <AddCouponButton />}
      </div>
      {!isContextReady ? (
        <WorkspaceAlert resource="coupons" />
      ) : (
        <QueryErrorBoundary>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <CouponsTableContent popupId={selectedPopupId} />
          </Suspense>
        </QueryErrorBoundary>
      )}
    </div>
  )
}
