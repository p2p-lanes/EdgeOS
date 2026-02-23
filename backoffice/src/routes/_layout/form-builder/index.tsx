import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
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
  FileText,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Suspense, useState } from "react"

import {
  type ApiError,
  type FormFieldPublic,
  FormFieldsService,
} from "@/client"
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

function getFormFieldsQueryOptions(
  popupId: string | null,
  page: number,
  pageSize: number,
  search?: string,
) {
  return {
    queryFn: () =>
      FormFieldsService.listFormFields({
        skip: page * pageSize,
        limit: pageSize,
        popupId: popupId || undefined,
        search: search || undefined,
      }),
    queryKey: ["form-fields", popupId, { page, pageSize, search }],
  }
}

export const Route = createFileRoute("/_layout/form-builder/")({
  component: FormFields,
  validateSearch: validateTableSearch,
  head: () => ({
    meta: [{ title: "Form Builder - EdgeOS" }],
  }),
})

function AddFormFieldButton() {
  return (
    <Button asChild>
      <Link to="/form-builder/new">
        <Plus className="mr-2 h-4 w-4" />
        Add Field
      </Link>
    </Button>
  )
}

function DeleteFormField({
  field,
  onSuccess,
}: {
  field: FormFieldPublic
  onSuccess: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: () => FormFieldsService.deleteFormField({ fieldId: field.id }),
    onSuccess: () => {
      showSuccessToast("Form field deleted successfully")
      setIsOpen(false)
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["form-fields"] }),
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
          <DialogTitle>Delete Form Field</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{field.label}"? Applications may
            lose their stored data for this field. This action cannot be undone.
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

function FormFieldActionsMenu({ field }: { field: FormFieldPublic }) {
  const [open, setOpen] = useState(false)
  const { isAdmin } = useAuth()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Form field actions">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/form-builder/$id/edit" params={{ id: field.id }}>
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
          <DeleteFormField field={field} onSuccess={() => setOpen(false)} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns: ColumnDef<FormFieldPublic>[] = [
  {
    accessorKey: "label",
    header: ({ column }) => <SortableHeader label="Label" column={column} />,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.label}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "field_type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.field_type}</Badge>
    ),
  },
  {
    accessorKey: "section",
    header: "Section",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.section || "—"}
      </span>
    ),
  },
  {
    accessorKey: "required",
    header: "Required",
    cell: ({ row }) =>
      row.original.required ? (
        <Badge variant="default">Required</Badge>
      ) : (
        <Badge variant="secondary">Optional</Badge>
      ),
  },
  {
    accessorKey: "position",
    header: ({ column }) => <SortableHeader label="Position" column={column} />,
    cell: ({ row }) => <span>{row.original.position}</span>,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <FormFieldActionsMenu field={row.original} />
      </div>
    ),
  },
]

function SortableFieldItem({ field }: { field: FormFieldPublic }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-background p-3 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{field.label}</span>
          <Badge variant="outline" className="shrink-0 text-xs">
            {field.field_type}
          </Badge>
          {field.required && (
            <Badge variant="default" className="shrink-0 text-xs">
              Required
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          {field.name}
        </p>
      </div>
      <FormFieldActionsMenu field={field} />
    </div>
  )
}

function SortableSectionGroup({
  section,
  fields,
  onReorder,
}: {
  section: string
  fields: FormFieldPublic[]
  onReorder: (sectionFields: FormFieldPublic[]) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    onReorder(arrayMove(fields, oldIndex, newIndex))
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground capitalize">
        {section}
      </h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5">
            {fields.map((field) => (
              <SortableFieldItem key={field.id} field={field} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableFieldList({ fields }: { fields: FormFieldPublic[] }) {
  const queryClient = useQueryClient()
  const { showErrorToast } = useCustomToast()
  const [isSaving, setIsSaving] = useState(false)

  const sorted = [...fields].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  )

  const sectionOrder: string[] = []
  const grouped: Record<string, FormFieldPublic[]> = {}
  for (const field of sorted) {
    const section = field.section || "Unsectioned"
    if (!grouped[section]) {
      grouped[section] = []
      sectionOrder.push(section)
    }
    grouped[section].push(field)
  }

  const handleSectionReorder = async (
    _section: string,
    reordered: FormFieldPublic[],
  ) => {
    setIsSaving(true)
    try {
      await Promise.all(
        reordered.map((field, idx) =>
          FormFieldsService.updateFormField({
            fieldId: field.id,
            requestBody: { position: idx },
          }),
        ),
      )
      queryClient.invalidateQueries({ queryKey: ["form-fields"] })
    } catch (err) {
      createErrorHandler(showErrorToast)(err as ApiError)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {isSaving && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Saving order...
        </p>
      )}
      {sectionOrder.map((section) => (
        <SortableSectionGroup
          key={section}
          section={section}
          fields={grouped[section]}
          onReorder={(reordered) => handleSectionReorder(section, reordered)}
        />
      ))}
    </div>
  )
}

function FormFieldsTableContent({ reorderMode }: { reorderMode: boolean }) {
  const { selectedPopupId } = useWorkspace()
  const searchParams = Route.useSearch()
  const { search, pagination, setSearch, setPagination } = useTableSearchParams(
    searchParams,
    "/form-builder",
  )

  const { data: formFields } = useQuery({
    ...getFormFieldsQueryOptions(
      selectedPopupId,
      pagination.pageIndex,
      pagination.pageSize,
      search,
    ),
    placeholderData: keepPreviousData,
  })

  if (!formFields) return <Skeleton className="h-64 w-full" />

  if (reorderMode && !search && formFields.results.length > 0) {
    return <SortableFieldList fields={formFields.results} />
  }

  return (
    <DataTable
      columns={columns}
      data={formFields.results}
      searchPlaceholder="Search by label, name, or type..."
      hiddenOnMobile={["name", "section", "required", "position"]}
      searchValue={search}
      onSearchChange={setSearch}
      serverPagination={{
        total: formFields.paging.total,
        pagination: pagination,
        onPaginationChange: setPagination,
      }}
      emptyState={
        !search ? (
          <EmptyState
            icon={FileText}
            title="No form fields yet"
            description="Add custom fields to build your application form."
            action={
              <Button asChild>
                <Link to="/form-builder/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Link>
              </Button>
            }
          />
        ) : undefined
      }
    />
  )
}

function FormFields() {
  const { isAdmin } = useAuth()
  const { isContextReady } = useWorkspace()
  const [reorderMode, setReorderMode] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      {!isContextReady && <WorkspaceAlert resource="form builder" />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Form Builder</h1>
          <p className="text-muted-foreground">
            Configure custom fields for application forms
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && isContextReady && (
            <Button
              variant={reorderMode ? "default" : "outline"}
              size="sm"
              onClick={() => setReorderMode(!reorderMode)}
            >
              <GripVertical className="mr-1.5 h-3.5 w-3.5" />
              {reorderMode ? "Done Reordering" : "Reorder"}
            </Button>
          )}
          {isAdmin && isContextReady && <AddFormFieldButton />}
        </div>
      </div>
      {isContextReady && (
        <QueryErrorBoundary>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <FormFieldsTableContent reorderMode={reorderMode} />
          </Suspense>
        </QueryErrorBoundary>
      )}
    </div>
  )
}
