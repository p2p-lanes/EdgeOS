import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import {
  EllipsisVertical,
  Eye,
  Package,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react"
import { Suspense, useState } from "react"

import {
  type ProductBatchItem,
  type ProductBatchResult,
  type ProductPublic,
  ProductsService,
} from "@/client"
import { CsvImportDialog } from "@/components/Common/CsvImportDialog"
import { DataTable, SortableHeader } from "@/components/Common/DataTable"
import { EmptyState } from "@/components/Common/EmptyState"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { StatusBadge } from "@/components/Common/StatusBadge"
import { WorkspaceAlert } from "@/components/Common/WorkspaceAlert"
import { productCsvColumns } from "@/components/products/useProductImport"
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

function getProductsQueryOptions(
  popupId: string | null,
  page: number,
  pageSize: number,
  search?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) {
  return {
    queryFn: () =>
      ProductsService.listProducts({
        skip: page * pageSize,
        limit: pageSize,
        popupId: popupId || undefined,
        search: search || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      }),
    queryKey: [
      "products",
      popupId,
      { page, pageSize, search, sortBy, sortOrder },
    ],
  }
}

export const Route = createFileRoute("/_layout/products/")({
  component: Products,
  validateSearch: validateTableSearch,
  head: () => ({
    meta: [{ title: "Products - EdgeOS" }],
  }),
})

function AddProductButton() {
  return (
    <Button asChild>
      <Link to="/products/new">
        <Plus className="mr-2 h-4 w-4" />
        Add Product
      </Link>
    </Button>
  )
}

function ProductActionsMenu({ product }: { product: ProductPublic }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { isAdmin } = useAuth()

  const deleteMutation = useMutation({
    mutationFn: () => ProductsService.deleteProduct({ productId: product.id }),
    onSuccess: () => {
      showSuccessToast("Product deleted")
      setDeleteDialogOpen(false)
    },
    onError: createErrorHandler(showErrorToast),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  })

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Product actions">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/products/$id/edit" params={{ id: product.id }}>
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
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setMenuOpen(false)
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{product.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleteMutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <LoadingButton
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const columns: ColumnDef<ProductPublic>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader label="Name" column={column} />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => <SortableHeader label="Price" column={column} />,
    cell: ({ row }) => <span className="font-mono">${row.original.price}</span>,
  },
  {
    accessorKey: "attendee_category",
    header: "Category",
    cell: ({ row }) => <StatusBadge status={row.original.category || "N/A"} />,
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
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ProductActionsMenu product={row.original} />
      </div>
    ),
  },
]

function ProductsTableContent() {
  const { selectedPopupId } = useWorkspace()
  const searchParams = Route.useSearch()
  const {
    search,
    pagination,
    sorting,
    sortBy,
    sortOrder,
    setSearch,
    setPagination,
    setSorting,
  } = useTableSearchParams(searchParams, "/products")

  const { data: products } = useQuery({
    ...getProductsQueryOptions(
      selectedPopupId,
      pagination.pageIndex,
      pagination.pageSize,
      search,
      sortBy,
      sortOrder,
    ),
    placeholderData: keepPreviousData,
  })

  if (!products) return <Skeleton className="h-64 w-full" />

  return (
    <DataTable
      columns={columns}
      data={products.results}
      searchPlaceholder="Search by name..."
      hiddenOnMobile={["attendee_category", "is_active"]}
      searchValue={search}
      onSearchChange={setSearch}
      serverPagination={{
        total: products.paging.total,
        pagination: pagination,
        onPaginationChange: setPagination,
      }}
      serverSorting={{
        sorting: sorting,
        onSortingChange: setSorting,
      }}
      emptyState={
        !search ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Create your first product or ticket to start selling."
            action={
              <Button asChild>
                <Link to="/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            }
          />
        ) : undefined
      }
    />
  )
}

function Products() {
  const { isAdmin, isSuperadmin } = useAuth()
  const { isContextReady, selectedPopupId, selectedTenantId } = useWorkspace()
  const [importOpen, setImportOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const importMutation = useMutation({
    mutationFn: (rows: ProductBatchItem[]) =>
      ProductsService.createProductsBatch({
        requestBody: {
          popup_id: selectedPopupId!,
          products: rows,
        },
        xTenantId: isSuperadmin ? (selectedTenantId ?? undefined) : undefined,
      }),
    onSuccess: (results) => {
      const successCount = results.filter((r) => r.success).length
      showSuccessToast(`${successCount} product(s) imported`)
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: createErrorHandler(showErrorToast),
  })

  return (
    <div className="flex flex-col gap-6">
      {!isContextReady && <WorkspaceAlert resource="products" />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage tickets and products for your popups
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperadmin && isContextReady && (
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          )}
          {isAdmin && isContextReady && <AddProductButton />}
        </div>
      </div>
      {isContextReady && (
        <QueryErrorBoundary>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <ProductsTableContent />
          </Suspense>
        </QueryErrorBoundary>
      )}
      <CsvImportDialog<ProductBatchItem, ProductBatchResult>
        open={importOpen}
        onOpenChange={setImportOpen}
        columns={productCsvColumns}
        resourceName="Product"
        onImport={(rows) => importMutation.mutateAsync(rows)}
        isPending={importMutation.isPending}
      />
    </div>
  )
}
