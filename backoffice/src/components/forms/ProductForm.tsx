import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Clock, DollarSign, Hash, Power, Users } from "lucide-react"
import {
  type ProductCategory,
  type ProductCreate,
  type ProductPublic,
  ProductsService,
  type ProductUpdate,
  type TicketAttendeeCategory,
  type TicketDuration,
} from "@/client"
import { DangerZone } from "@/components/Common/DangerZone"
import { FieldError } from "@/components/Common/FieldError"
import { WorkspaceAlert } from "@/components/Common/WorkspaceAlert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HeroInput,
  InlineRow,
  InlineSection,
} from "@/components/ui/inline-form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import {
  UnsavedChangesDialog,
  useUnsavedChanges,
} from "@/hooks/useUnsavedChanges"
import { createErrorHandler } from "@/utils"

interface ProductFormProps {
  defaultValues?: ProductPublic
  onSuccess: () => void
}

const PRODUCT_CATEGORIES: {
  value: ProductCategory
  label: string
}[] = [
  { value: "ticket", label: "Ticket" },
  { value: "housing", label: "Housing" },
  { value: "merch", label: "Merchandise" },
  { value: "other", label: "Other" },
  { value: "patreon", label: "Patreon" },
]

const TICKET_DURATIONS: { value: TicketDuration; label: string }[] = [
  { value: "day", label: "Day Pass" },
  { value: "week", label: "Week Pass" },
  { value: "month", label: "Month Pass" },
  { value: "full", label: "Full Event" },
]

const ATTENDEE_CATEGORIES: { value: TicketAttendeeCategory; label: string }[] =
  [
    { value: "main", label: "Main Attendee" },
    { value: "spouse", label: "Spouse" },
    { value: "kid", label: "Kid" },
  ]

export function ProductForm({ defaultValues, onSuccess }: ProductFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { selectedPopupId, isContextReady } = useWorkspace()
  const { isAdmin } = useAuth()
  const isEdit = !!defaultValues
  const readOnly = !isAdmin

  const createMutation = useMutation({
    mutationFn: (data: ProductCreate) =>
      ProductsService.createProduct({ requestBody: data }),
    onSuccess: (data) => {
      showSuccessToast("Product created successfully", {
        label: "View",
        onClick: () =>
          navigate({ to: "/products/$id/edit", params: { id: data.id } }),
      })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const updateMutation = useMutation({
    mutationFn: (data: ProductUpdate) =>
      ProductsService.updateProduct({
        productId: defaultValues!.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Product updated successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      ProductsService.deleteProduct({ productId: defaultValues!.id }),
    onSuccess: () => {
      showSuccessToast("Product deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      navigate({ to: "/products" })
    },
    onError: createErrorHandler(showErrorToast),
  })

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      price: defaultValues?.price?.toString() ?? "",
      description: defaultValues?.description ?? "",
      category: (defaultValues?.category ?? "ticket") as ProductCategory,
      attendee_category: (defaultValues?.attendee_category ??
        "main") as TicketAttendeeCategory,
      duration_type: (defaultValues?.duration_type ?? "full") as TicketDuration,
      is_active: defaultValues?.is_active ?? true,
      max_quantity: defaultValues?.max_quantity?.toString() ?? "",
    },
    onSubmit: ({ value }) => {
      if (readOnly) return

      const isTicket = value.category === "ticket"

      const maxQty = value.max_quantity
        ? Number.parseInt(value.max_quantity, 10)
        : null

      if (isEdit) {
        updateMutation.mutate({
          name: value.name,
          price: value.price,
          description: value.description || null,
          category: value.category,
          attendee_category: isTicket ? value.attendee_category : null,
          duration_type: isTicket ? value.duration_type : null,
          is_active: value.is_active,
          max_quantity: maxQty,
        })
      } else {
        if (!selectedPopupId) {
          showErrorToast("Please select a popup first")
          return
        }
        createMutation.mutate({
          popup_id: selectedPopupId,
          name: value.name,
          price: value.price,
          description: value.description || undefined,
          category: value.category,
          attendee_category: isTicket ? value.attendee_category : undefined,
          duration_type: isTicket ? value.duration_type : undefined,
          is_active: value.is_active,
          max_quantity: maxQty ?? undefined,
        })
      }
    },
  })

  const blocker = useUnsavedChanges(form)

  const isPending = createMutation.isPending || updateMutation.isPending

  if (!isEdit && !isContextReady) {
    return <WorkspaceAlert resource="product" action="create" />
  }

  return (
    <div className="space-y-6">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (!readOnly) {
            form.handleSubmit()
          }
        }}
        className="mx-auto max-w-2xl space-y-6"
      >
        {/* Hero: Name + Category Badge */}
        <div className="space-y-3">
          <form.Field
            name="name"
            validators={{
              onBlur: ({ value }) =>
                !readOnly && !value ? "Name is required" : undefined,
            }}
          >
            {(field) => (
              <div>
                <HeroInput
                  placeholder="Product Name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={readOnly}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="category">
            {(field) => (
              <div className="flex items-center gap-2">
                <Select
                  value={field.state.value}
                  onValueChange={(val) =>
                    field.handleChange(val as ProductCategory)
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0">
                    <Badge variant="secondary">
                      <SelectValue />
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        </div>

        {/* Product Details metadata (edit only) */}
        {isEdit && (
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div>
              <span className="text-xs uppercase tracking-wider">Slug</span>
              <p className="font-mono">{defaultValues.slug}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider">ID</span>
              <p className="font-mono text-xs">{defaultValues.id}</p>
            </div>
          </div>
        )}

        <Separator />

        {/* Description */}
        <form.Field name="description">
          {(field) => (
            <div className="space-y-2">
              <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Description
              </p>
              <Textarea
                placeholder="Product description..."
                rows={2}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={readOnly}
              />
            </div>
          )}
        </form.Field>

        <Separator />

        {/* Pricing & Inventory */}
        <InlineSection title="Pricing & Inventory">
          <form.Field
            name="price"
            validators={{
              onBlur: ({ value }) =>
                !readOnly && !value ? "Price is required" : undefined,
            }}
          >
            {(field) => (
              <div>
                <InlineRow
                  icon={
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  }
                  label="Price"
                >
                  <Input
                    placeholder="100.00"
                    type="text"
                    inputMode="decimal"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={readOnly}
                    className="max-w-32 text-sm"
                  />
                </InlineRow>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="max_quantity"
            validators={{
              onBlur: ({ value }) => {
                if (readOnly || !value) return undefined
                const num = Number.parseInt(value, 10)
                if (Number.isNaN(num) || num < 1) {
                  return "Max quantity must be a positive number"
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <div>
                <InlineRow
                  icon={<Hash className="h-4 w-4 text-muted-foreground" />}
                  label="Max Quantity"
                  description="Leave empty for unlimited"
                >
                  <Input
                    placeholder="Unlimited"
                    type="number"
                    min="1"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={readOnly}
                    className="max-w-32 text-sm"
                  />
                </InlineRow>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="is_active">
            {(field) => (
              <InlineRow
                icon={<Power className="h-4 w-4 text-muted-foreground" />}
                label="Active"
                description="Product is available for purchase"
              >
                <Switch
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  disabled={readOnly}
                />
              </InlineRow>
            )}
          </form.Field>
        </InlineSection>

        {/* Ticket Options (conditional) */}
        <form.Subscribe selector={(state) => state.values.category}>
          {(category) =>
            category === "ticket" && (
              <>
                <Separator />
                <InlineSection title="Ticket Options">
                  <form.Field name="duration_type">
                    {(field) => (
                      <InlineRow
                        icon={
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        }
                        label="Duration"
                        description="How long the ticket is valid"
                      >
                        <Select
                          value={field.state.value}
                          onValueChange={(val) =>
                            field.handleChange(val as TicketDuration)
                          }
                          disabled={readOnly}
                        >
                          <SelectTrigger className="w-auto text-sm">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            {TICKET_DURATIONS.map((dur) => (
                              <SelectItem key={dur.value} value={dur.value}>
                                {dur.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InlineRow>
                    )}
                  </form.Field>

                  <form.Field name="attendee_category">
                    {(field) => (
                      <InlineRow
                        icon={
                          <Users className="h-4 w-4 text-muted-foreground" />
                        }
                        label="Attendee Type"
                        description="Who can purchase this ticket"
                      >
                        <Select
                          value={field.state.value}
                          onValueChange={(val) =>
                            field.handleChange(val as TicketAttendeeCategory)
                          }
                          disabled={readOnly}
                        >
                          <SelectTrigger className="w-auto text-sm">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDEE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InlineRow>
                    )}
                  </form.Field>
                </InlineSection>
              </>
            )
          }
        </form.Subscribe>

        <Separator />

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/products" })}
          >
            {readOnly ? "Back" : "Cancel"}
          </Button>
          {!readOnly && (
            <LoadingButton type="submit" loading={isPending}>
              {isEdit ? "Save Changes" : "Create Product"}
            </LoadingButton>
          )}
        </div>
      </form>

      {isEdit && !readOnly && (
        <div className="mx-auto max-w-2xl">
          <DangerZone
            description="Once you delete this product, it will be permanently removed. Existing purchases will not be affected."
            onDelete={() => deleteMutation.mutate()}
            isDeleting={deleteMutation.isPending}
            confirmText="Delete Product"
            resourceName={defaultValues.name}
            variant="inline"
          />
        </div>
      )}
      <UnsavedChangesDialog blocker={blocker} />
    </div>
  )
}
