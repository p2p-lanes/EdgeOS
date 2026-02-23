import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Copy,
  CreditCard,
  Download,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Fingerprint,
  Hash,
  Tag,
} from "lucide-react"
import { Suspense, useState } from "react"

import { type PaymentPublic, PaymentsService } from "@/client"
import { DataTable, SortableHeader } from "@/components/Common/DataTable"
import { EmptyState } from "@/components/Common/EmptyState"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { StatusBadge } from "@/components/Common/StatusBadge"
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
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import useCustomToast from "@/hooks/useCustomToast"
import {
  useTableSearchParams,
  validateTableSearch,
} from "@/hooks/useTableSearchParams"
import { exportToCsv, fetchAllPages } from "@/lib/export"

function getPaymentsQueryOptions(
  popupId: string | null,
  page: number,
  pageSize: number,
) {
  return {
    queryFn: () =>
      PaymentsService.listPayments({
        skip: page * pageSize,
        limit: pageSize,
        popupId: popupId || undefined,
      }),
    queryKey: ["payments", popupId, { page, pageSize }],
  }
}

export const Route = createFileRoute("/_layout/payments")({
  component: Payments,
  validateSearch: validateTableSearch,
  head: () => ({
    meta: [{ title: "Payments - EdgeOS" }],
  }),
})

function ViewPayment({ payment }: { payment: PaymentPublic }) {
  const [isOpen, setIsOpen] = useState(false)
  const [, copy] = useCopyToClipboard()
  const { showSuccessToast } = useCustomToast()

  const copyToClipboard = (text: string, label: string) => {
    copy(text)
    showSuccessToast(`${label} copied to clipboard`)
  }

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
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Payment #{payment.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        {/* Hero */}
        <div className="space-y-1 px-6 pt-6 pb-4">
          <p className="font-mono text-3xl font-semibold">
            ${payment.amount}{" "}
            <span className="text-lg text-muted-foreground">
              {payment.currency}
            </span>
          </p>
          <StatusBadge status={payment.status ?? ""} />
        </div>

        <Separator />

        {/* Details */}
        <InlineSection title="Details" className="px-6 py-4">
          {payment.source && (
            <InlineRow
              icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
              label="Source"
            >
              <span className="text-sm">{payment.source}</span>
            </InlineRow>
          )}
          {payment.rate && (
            <InlineRow
              icon={<Hash className="h-4 w-4 text-muted-foreground" />}
              label="Rate"
            >
              <span className="font-mono text-sm">{payment.rate}</span>
            </InlineRow>
          )}
          {payment.coupon_code && (
            <InlineRow
              icon={<Tag className="h-4 w-4 text-muted-foreground" />}
              label="Coupon"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">{payment.coupon_code}</Badge>
                {payment.discount_value && (
                  <span className="text-sm text-green-600">
                    -{payment.discount_value}%
                  </span>
                )}
              </div>
            </InlineRow>
          )}
        </InlineSection>

        <Separator />

        {/* Identifiers */}
        <InlineSection title="Identifiers" className="px-6 py-4">
          <InlineRow
            icon={<Fingerprint className="h-4 w-4 text-muted-foreground" />}
            label="Payment ID"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {payment.id.slice(0, 8)}...
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Copy Payment ID"
                onClick={() => copyToClipboard(payment.id, "Payment ID")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </InlineRow>
          {payment.external_id && (
            <InlineRow
              icon={<ExternalLink className="h-4 w-4 text-muted-foreground" />}
              label="External ID"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {payment.external_id.slice(0, 12)}...
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Copy External ID"
                  onClick={() =>
                    copyToClipboard(payment.external_id!, "External ID")
                  }
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </InlineRow>
          )}
          {payment.checkout_url && (
            <InlineRow
              icon={<ExternalLink className="h-4 w-4 text-muted-foreground" />}
              label="Checkout"
            >
              <a
                href={payment.checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Open link
              </a>
            </InlineRow>
          )}
        </InlineSection>

        {/* Products */}
        {payment.products_snapshot && payment.products_snapshot.length > 0 && (
          <>
            <Separator />
            <InlineSection title="Products" className="px-6 py-4">
              {payment.products_snapshot.map((product) => (
                <div
                  key={`${product.product_id}-${product.attendee_id}`}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-sm">{product.product_name}</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {product.quantity}x ${product.product_price}
                  </span>
                </div>
              ))}
            </InlineSection>
          </>
        )}

        {/* Footer */}
        <Separator />
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex gap-4 text-xs text-muted-foreground">
            {payment.created_at && (
              <span>{new Date(payment.created_at).toLocaleDateString()}</span>
            )}
            {payment.updated_at && (
              <span>
                Updated {new Date(payment.updated_at).toLocaleDateString()}
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

function PaymentActionsMenu({ payment }: { payment: PaymentPublic }) {
  const [open, setOpen] = useState(false)
  const [, copy] = useCopyToClipboard()
  const { showSuccessToast } = useCustomToast()

  const copyPaymentId = () => {
    copy(payment.id)
    showSuccessToast("Payment ID copied")
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Payment actions">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ViewPayment payment={payment} />
        <DropdownMenuItem onClick={copyPaymentId}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Payment ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns: ColumnDef<PaymentPublic>[] = [
  {
    accessorKey: "amount",
    header: ({ column }) => <SortableHeader label="Amount" column={column} />,
    cell: ({ row }) => (
      <span className="font-mono">
        ${row.original.amount} {row.original.currency}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader label="Status" column={column} />,
    cell: ({ row }) => <StatusBadge status={row.original.status ?? ""} />,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.source || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "coupon_code",
    header: "Coupon",
    cell: ({ row }) =>
      row.original.coupon_code ? (
        <Badge variant="outline">{row.original.coupon_code}</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <SortableHeader label="Date" column={column} />,
    cell: ({ row }) => {
      const date = row.original.created_at
      if (!date) return <span className="text-muted-foreground">N/A</span>
      return (
        <span className="text-muted-foreground">
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(date))}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PaymentActionsMenu payment={row.original} />
      </div>
    ),
  },
]

function PaymentsTableContent() {
  const { selectedPopupId } = useWorkspace()
  const searchParams = Route.useSearch()
  const { search, pagination, setSearch, setPagination } = useTableSearchParams(
    searchParams,
    "/payments",
  )

  const { data: payments } = useQuery({
    ...getPaymentsQueryOptions(
      selectedPopupId,
      pagination.pageIndex,
      pagination.pageSize,
    ),
    placeholderData: keepPreviousData,
  })

  if (!payments) return <Skeleton className="h-64 w-full" />

  const filtered = search
    ? payments.results.filter((p) => {
        const term = search.toLowerCase()
        return (
          (p.status ?? "").toLowerCase().includes(term) ||
          (p.source ?? "").toLowerCase().includes(term) ||
          (p.coupon_code ?? "").toLowerCase().includes(term) ||
          String(p.amount).includes(term)
        )
      })
    : payments.results

  return (
    <DataTable
      columns={columns}
      data={filtered}
      searchPlaceholder="Search by status, source, coupon, or amount..."
      hiddenOnMobile={["source", "coupon_code", "created_at"]}
      searchValue={search}
      onSearchChange={setSearch}
      serverPagination={{
        total: search ? filtered.length : payments.paging.total,
        pagination: search
          ? { pageIndex: 0, pageSize: payments.paging.total }
          : pagination,
        onPaginationChange: setPagination,
      }}
      emptyState={
        !search ? (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Payment transactions will appear here once attendees start purchasing products."
          />
        ) : undefined
      }
    />
  )
}

function Payments() {
  const { isContextReady, selectedPopupId } = useWorkspace()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!selectedPopupId) return
    setIsExporting(true)
    try {
      const results = await fetchAllPages((skip, limit) =>
        PaymentsService.listPayments({
          skip,
          limit,
          popupId: selectedPopupId,
        }),
      )
      exportToCsv("payments", results as unknown as Record<string, unknown>[], [
        { key: "amount", label: "Amount" },
        { key: "currency", label: "Currency" },
        { key: "status", label: "Status" },
        { key: "source", label: "Source" },
        { key: "coupon_code", label: "Coupon" },
        { key: "created_at", label: "Date" },
      ])
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage payment transactions
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
        <WorkspaceAlert resource="payments" />
      ) : (
        <QueryErrorBoundary>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <PaymentsTableContent />
          </Suspense>
        </QueryErrorBoundary>
      )}
    </div>
  )
}
