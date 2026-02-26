import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Mail, Plus, Trash2, User, Users } from "lucide-react"
import { useState } from "react"
import {
  type ApplicationAdminCreate,
  type ApplicationStatus,
  ApplicationsService,
  type CompanionCreate,
  FormFieldsService,
} from "@/client"
import { FieldError } from "@/components/Common/FieldError"
import { FormErrorSummary } from "@/components/Common/FormErrorSummary"
import { WorkspaceAlert } from "@/components/Common/WorkspaceAlert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useCustomToast from "@/hooks/useCustomToast"
import {
  UnsavedChangesDialog,
  useUnsavedChanges,
} from "@/hooks/useUnsavedChanges"
import { createErrorHandler } from "@/utils"

// Type for the application schema response
interface FormFieldSchema {
  type: string
  label: string
  required: boolean
  section: string
  position?: number
  options?: string[]
  placeholder?: string
  help_text?: string
  target?: "human" | "application"
}

interface ApplicationSchema {
  base_fields: Record<string, FormFieldSchema>
  custom_fields: Record<string, FormFieldSchema>
  sections: string[]
}

// Type for companion with client-side ID for React key
interface CompanionWithId extends CompanionCreate {
  _id: string
}

interface ApplicationFormProps {
  onSuccess: () => void
}

/** Fields on the Human model that map to named API fields */
const HUMAN_FIELD_KEYS = new Set([
  "first_name",
  "last_name",
  "telegram",
  "organization",
  "role",
  "gender",
  "age",
  "residence",
])

/** Fields on the Application model that map to named API fields */
const APPLICATION_FIELD_KEYS = new Set(["referral", "info_not_shared"])

export function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { selectedPopupId, isContextReady } = useWorkspace()

  // State for companions (spouse/kids) with client-side IDs for React keys
  const [companions, setCompanions] = useState<CompanionWithId[]>([])
  // Track if saving as draft
  const [savingAsDraft, setSavingAsDraft] = useState(false)

  // Check if spouse already added
  const hasSpouse = companions.some((c) => c.category === "spouse")

  // Fetch schema for the selected popup
  const {
    data: schema,
    isLoading: schemaLoading,
    isError: _schemaError,
  } = useQuery({
    queryKey: ["form-fields-schema", selectedPopupId],
    queryFn: async () => {
      if (!selectedPopupId) return null
      const result = await FormFieldsService.getApplicationSchema({
        popupId: selectedPopupId,
      })
      return result as unknown as ApplicationSchema
    },
    enabled: !!selectedPopupId,
  })

  const createMutation = useMutation({
    mutationFn: (data: ApplicationAdminCreate) =>
      ApplicationsService.createApplicationAdmin({ requestBody: data }),
    onSuccess: (data) => {
      showSuccessToast("Application created successfully", {
        label: "View",
        onClick: () =>
          navigate({ to: "/applications/$id", params: { id: data.id } }),
      })
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  // Build initial custom fields values
  const getInitialCustomFields = (): Record<string, unknown> => {
    if (!schema?.custom_fields) return {}
    const initial: Record<string, unknown> = {}
    for (const [name, field] of Object.entries(schema.custom_fields)) {
      if (field.type === "boolean") {
        initial[name] = false
      } else if (field.type === "multiselect") {
        initial[name] = []
      } else {
        initial[name] = ""
      }
    }
    return initial
  }

  // Build initial base field values from schema
  const getInitialBaseFields = (): Record<string, unknown> => {
    if (!schema?.base_fields) return {}
    const initial: Record<string, unknown> = {}
    for (const [name, field] of Object.entries(schema.base_fields)) {
      if (field.type === "boolean") {
        initial[name] = false
      } else if (field.type === "multiselect") {
        initial[name] = []
      } else {
        initial[name] = ""
      }
    }
    return initial
  }

  const form = useForm({
    defaultValues: {
      // Email is backoffice-only (not in base_fields)
      email: "",
      // Base fields from schema (profile + application)
      ...getInitialBaseFields(),
      // Custom fields - will be populated dynamically
      custom_fields: getInitialCustomFields(),
    },
    onSubmit: ({ value }) => {
      if (!selectedPopupId) {
        showErrorToast("Please select a popup first")
        return
      }

      // Clean up custom fields - remove empty values
      const cleanedCustomFields: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(
        value.custom_fields as Record<string, unknown>,
      )) {
        if (val !== "" && val !== null && val !== undefined) {
          if (Array.isArray(val) && val.length === 0) continue
          cleanedCustomFields[key] = val
        }
      }

      // Status is "draft" if saving as draft, otherwise "in review"
      const status = savingAsDraft ? "draft" : "in review"

      // Build the payload dynamically from base_fields target
      const payload: Record<string, unknown> = {
        popup_id: selectedPopupId,
        email: (value as Record<string, unknown>).email || undefined,
        status: status as ApplicationStatus,
        custom_fields:
          Object.keys(cleanedCustomFields).length > 0
            ? cleanedCustomFields
            : undefined,
        companions:
          companions.length > 0
            ? companions.map(({ _id, ...rest }) => rest)
            : undefined,
      }

      // Map base fields to their named API fields
      if (schema?.base_fields) {
        for (const name of Object.keys(schema.base_fields)) {
          const val = (value as Record<string, unknown>)[name]
          if (HUMAN_FIELD_KEYS.has(name) || APPLICATION_FIELD_KEYS.has(name)) {
            payload[name] = val || undefined
          }
        }
        // first_name and last_name are required strings
        payload.first_name = (value as Record<string, unknown>).first_name || ""
        payload.last_name = (value as Record<string, unknown>).last_name || ""
      }

      createMutation.mutate(payload as unknown as ApplicationAdminCreate)
    },
  })

  const blocker = useUnsavedChanges(form)

  // Show alert if no popup selected
  if (!isContextReady) {
    return <WorkspaceAlert resource="application" action="create" />
  }

  if (schemaLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  // Sort base fields by position
  const sortedBaseFields = schema?.base_fields
    ? Object.entries(schema.base_fields).sort(
        ([, a], [, b]) => (a.position ?? 0) - (b.position ?? 0),
      )
    : []

  // Sort custom fields by position
  const sortedCustomFields = schema?.custom_fields
    ? Object.entries(schema.custom_fields).sort(
        ([, a], [, b]) => (a.position ?? 0) - (b.position ?? 0),
      )
    : []

  // Split custom fields: no section -> inline with base fields, with section -> separate cards
  const unsectionedFields = sortedCustomFields.filter(
    ([, field]) => !field.section,
  )
  const sectionedFields = sortedCustomFields.filter(
    ([, field]) => !!field.section,
  )

  // Group sectioned fields by section name
  const fieldsBySection: Record<string, [string, FormFieldSchema][]> = {}
  for (const [name, field] of sectionedFields) {
    const section = field.section!
    if (!fieldsBySection[section]) {
      fieldsBySection[section] = []
    }
    fieldsBySection[section].push([name, field])
  }

  const getRequiredValidator = (fieldSchema: FormFieldSchema) => {
    if (!fieldSchema.required) return undefined
    return {
      onBlur: ({ value }: { value: unknown }) => {
        if (fieldSchema.type === "boolean") {
          return value !== true ? `${fieldSchema.label} is required` : undefined
        }
        if (fieldSchema.type === "multiselect") {
          return !Array.isArray(value) || value.length === 0
            ? `${fieldSchema.label} is required`
            : undefined
        }
        return !value ? `${fieldSchema.label} is required` : undefined
      },
    }
  }

  const renderFieldError = (errors: string[]) => {
    if (errors.length === 0) return null
    return <p className="text-destructive text-sm">{errors.join(", ")}</p>
  }

  /** Render a field using form.Field with the given path.
   * fieldPath is cast because base fields are added dynamically via schema
   * and can't be statically inferred by tanstack/react-form's type system. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderSchemaField = (
    name: string,
    field: FormFieldSchema,
    fieldPath: any,
  ) => {
    const validators = getRequiredValidator(field)

    switch (field.type) {
      case "text":
      case "email":
      case "url":
        return (
          <form.Field name={fieldPath} key={name} validators={validators}>
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={name}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                <Input
                  id={name}
                  type={field.type === "email" ? "email" : "text"}
                  placeholder={field.placeholder}
                  value={(formField.state.value as string) || ""}
                  onBlur={formField.handleBlur}
                  onChange={(e) => formField.handleChange(e.target.value)}
                />
                {field.help_text && (
                  <p className="text-sm text-muted-foreground">
                    {field.help_text}
                  </p>
                )}
                {renderFieldError(formField.state.meta.errors as string[])}
              </div>
            )}
          </form.Field>
        )

      case "textarea":
        return (
          <form.Field name={fieldPath} key={name} validators={validators}>
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={name}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                <Textarea
                  id={name}
                  placeholder={field.placeholder}
                  value={(formField.state.value as string) || ""}
                  onBlur={formField.handleBlur}
                  onChange={(e) => formField.handleChange(e.target.value)}
                />
                {field.help_text && (
                  <p className="text-sm text-muted-foreground">
                    {field.help_text}
                  </p>
                )}
                {renderFieldError(formField.state.meta.errors as string[])}
              </div>
            )}
          </form.Field>
        )

      case "number":
        return (
          <form.Field name={fieldPath} key={name} validators={validators}>
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={name}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                <Input
                  id={name}
                  type="number"
                  placeholder={field.placeholder}
                  value={(formField.state.value as string) || ""}
                  onBlur={formField.handleBlur}
                  onChange={(e) => formField.handleChange(e.target.value)}
                />
                {field.help_text && (
                  <p className="text-sm text-muted-foreground">
                    {field.help_text}
                  </p>
                )}
                {renderFieldError(formField.state.meta.errors as string[])}
              </div>
            )}
          </form.Field>
        )

      case "boolean":
        return (
          <form.Field name={fieldPath} key={name} validators={validators}>
            {(formField) => (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={name}
                    checked={(formField.state.value as boolean) || false}
                    onCheckedChange={(checked) => {
                      formField.handleChange(checked)
                      formField.handleBlur()
                    }}
                  />
                  <Label htmlFor={name} className="font-normal">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>
                </div>
                {field.help_text && (
                  <p className="text-sm text-muted-foreground">
                    {field.help_text}
                  </p>
                )}
                {renderFieldError(formField.state.meta.errors as string[])}
              </div>
            )}
          </form.Field>
        )

      case "select":
        return (
          <form.Field name={fieldPath} key={name} validators={validators}>
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={name}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                <Select
                  value={(formField.state.value as string) || ""}
                  onValueChange={(val) => {
                    formField.handleChange(val)
                    formField.handleBlur()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={field.placeholder || "Select..."}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.help_text && (
                  <p className="text-sm text-muted-foreground">
                    {field.help_text}
                  </p>
                )}
                {renderFieldError(formField.state.meta.errors as string[])}
              </div>
            )}
          </form.Field>
        )

      case "multiselect":
        return (
          <form.Field name={fieldPath} key={name} validators={validators}>
            {(formField) => {
              const selectedValues = (formField.state.value as string[]) || []
              return (
                <div className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>
                  <div className="space-y-2 rounded-md border p-3">
                    {field.options?.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${name}-${option}`}
                          checked={selectedValues.includes(option)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              formField.handleChange([
                                ...selectedValues,
                                option,
                              ])
                            } else {
                              formField.handleChange(
                                selectedValues.filter((v) => v !== option),
                              )
                            }
                            formField.handleBlur()
                          }}
                        />
                        <Label
                          htmlFor={`${name}-${option}`}
                          className="font-normal"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {field.help_text && (
                    <p className="text-sm text-muted-foreground">
                      {field.help_text}
                    </p>
                  )}
                  {renderFieldError(formField.state.meta.errors as string[])}
                </div>
              )
            }}
          </form.Field>
        )

      case "date":
        return (
          <form.Field name={fieldPath} key={name} validators={validators}>
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={name}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                <Input
                  id={name}
                  type="date"
                  value={(formField.state.value as string) || ""}
                  onBlur={formField.handleBlur}
                  onChange={(e) => formField.handleChange(e.target.value)}
                />
                {field.help_text && (
                  <p className="text-sm text-muted-foreground">
                    {field.help_text}
                  </p>
                )}
                {renderFieldError(formField.state.meta.errors as string[])}
              </div>
            )}
          </form.Field>
        )

      default:
        return null
    }
  }

  const renderCustomField = (name: string, field: FormFieldSchema) =>
    renderSchemaField(name, field, `custom_fields.${name}`)

  const renderBaseField = (name: string, field: FormFieldSchema) =>
    renderSchemaField(name, field, name)

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <FormErrorSummary form={form} fieldLabels={{}} />
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Form Fields */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profile Information — driven by schema base_fields */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Basic applicant information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email is backoffice-only, always rendered first */}
                <form.Field
                  name="email"
                  validators={{
                    onBlur: ({ value }) =>
                      !value ? "Email is required" : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>

                {/* Base fields from schema */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {sortedBaseFields.map(([name, field]) =>
                    renderBaseField(name, field),
                  )}
                </div>

                {unsectionedFields.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      {unsectionedFields.map(([name, field]) =>
                        renderCustomField(name, field),
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Companions (Spouse/Kids) */}
            <Card>
              <CardHeader>
                <CardTitle>Companions</CardTitle>
                <CardDescription>
                  Add spouse or children attending with the applicant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {companions.map((companion) => (
                  <div
                    key={companion._id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize text-muted-foreground">
                          {companion.category === "spouse" ? "Spouse" : "Child"}
                        </span>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={companion.name}
                            onChange={(e) => {
                              setCompanions((prev) =>
                                prev.map((c) =>
                                  c._id === companion._id
                                    ? { ...c, name: e.target.value }
                                    : c,
                                ),
                              )
                            }}
                            placeholder="Full name"
                          />
                        </div>
                        {companion.category === "spouse" && (
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={companion.email || ""}
                              onChange={(e) => {
                                setCompanions((prev) =>
                                  prev.map((c) =>
                                    c._id === companion._id
                                      ? { ...c, email: e.target.value || null }
                                      : c,
                                  ),
                                )
                              }}
                              placeholder="Optional"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <Select
                            value={companion.gender || ""}
                            onValueChange={(val) => {
                              setCompanions((prev) =>
                                prev.map((c) =>
                                  c._id === companion._id
                                    ? { ...c, gender: val || null }
                                    : c,
                                ),
                              )
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove companion"
                      className="mt-6"
                      onClick={() => {
                        setCompanions((prev) =>
                          prev.filter((c) => c._id !== companion._id),
                        )
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2">
                  {!hasSpouse && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCompanions((prev) => [
                          ...prev,
                          {
                            _id: crypto.randomUUID(),
                            name: "",
                            category: "spouse",
                            email: null,
                            gender: null,
                          },
                        ])
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Spouse
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCompanions((prev) => [
                        ...prev,
                        {
                          _id: crypto.randomUUID(),
                          name: "",
                          category: "kid",
                          email: null,
                          gender: null,
                        },
                      ])
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Kid
                  </Button>
                </div>
              </CardContent>
            </Card>

            {Object.entries(fieldsBySection).map(([section, fields]) => (
              <Card key={section}>
                <CardHeader>
                  <CardTitle className="capitalize">{section}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map(([name, field]) =>
                    renderCustomField(name, field),
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/applications", search: {} })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={createMutation.isPending}
                onClick={() => {
                  setSavingAsDraft(true)
                  form.handleSubmit()
                }}
              >
                Save as Draft
              </Button>
              <LoadingButton
                type="button"
                loading={createMutation.isPending && !savingAsDraft}
                onClick={() => {
                  setSavingAsDraft(false)
                  form.handleSubmit()
                }}
              >
                Submit Application
              </LoadingButton>
            </div>
          </div>

          {/* Right Column - Preview (driven by schema) */}
          <div className="space-y-6">
            <form.Subscribe
              selector={(state) => ({
                values: state.values,
              })}
            >
              {({ values }) => {
                const vals = values as Record<string, unknown>
                const fullName =
                  `${vals.first_name ?? ""} ${vals.last_name ?? ""}`.trim()

                // Build preview items from base_fields
                const previewItems: {
                  label: string
                  value: string
                  icon?: boolean
                }[] = []
                if (schema?.base_fields) {
                  for (const [name, field] of sortedBaseFields) {
                    if (
                      name === "first_name" ||
                      name === "last_name"
                    )
                      continue
                    const val = vals[name]
                    if (!val || (typeof val === "string" && !val.trim()))
                      continue
                    if (Array.isArray(val) && val.length === 0) continue

                    const displayValue = Array.isArray(val)
                      ? val.join(", ")
                      : String(val)
                    previewItems.push({
                      label: field.label,
                      value: displayValue,
                    })
                  }
                }

                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Preview</CardTitle>
                      <CardDescription>
                        Application summary preview
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium leading-none">
                            {fullName || "Applicant Name"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(vals.organization as string) || "Organization"}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {(vals.email as string) || "email@example.com"}
                          </span>
                        </div>

                        {previewItems.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {item.label}
                            </span>
                            <span>{item.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Custom Fields Preview */}
                      {(() => {
                        const customVals = vals.custom_fields as Record<
                          string,
                          unknown
                        >
                        if (!customVals) return null

                        const hasAny = Object.entries(customVals).some(
                          ([, v]) =>
                            v !== "" &&
                            v !== false &&
                            !(Array.isArray(v) && v.length === 0),
                        )
                        if (!hasAny) return null

                        const renderPreviewField = (
                          key: string,
                          value: unknown,
                        ) => {
                          if (
                            value === "" ||
                            value === false ||
                            (Array.isArray(value) && value.length === 0)
                          )
                            return null

                          const fieldDef = schema?.custom_fields?.[key]
                          const label =
                            fieldDef?.label ||
                            key
                              .split("_")
                              .map(
                                (w) => w.charAt(0).toUpperCase() + w.slice(1),
                              )
                              .join(" ")

                          let displayValue: string
                          if (typeof value === "boolean") {
                            displayValue = value ? "Yes" : "No"
                          } else if (Array.isArray(value)) {
                            displayValue = value.join(", ")
                          } else {
                            displayValue = String(value)
                          }

                          return (
                            <div
                              key={key}
                              className="flex items-start justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {label}
                              </span>
                              <span className="text-right max-w-[60%] break-words">
                                {displayValue}
                              </span>
                            </div>
                          )
                        }

                        const previewUnsectioned = Object.entries(
                          customVals,
                        ).filter(
                          ([key]) => !schema?.custom_fields?.[key]?.section,
                        )
                        const previewSectioned: Record<
                          string,
                          [string, unknown][]
                        > = {}
                        for (const [key, value] of Object.entries(customVals)) {
                          const section =
                            schema?.custom_fields?.[key]?.section
                          if (section) {
                            if (!previewSectioned[section])
                              previewSectioned[section] = []
                            previewSectioned[section].push([key, value])
                          }
                        }

                        return (
                          <>
                            {previewUnsectioned.some(
                              ([, v]) =>
                                v !== "" &&
                                v !== false &&
                                !(Array.isArray(v) && v.length === 0),
                            ) && (
                              <div className="space-y-2">
                                {previewUnsectioned.map(([key, value]) =>
                                  renderPreviewField(key, value),
                                )}
                              </div>
                            )}
                            {Object.entries(previewSectioned).map(
                              ([section, fields]) => {
                                const hasValues = fields.some(
                                  ([, v]) =>
                                    v !== "" &&
                                    v !== false &&
                                    !(Array.isArray(v) && v.length === 0),
                                )
                                if (!hasValues) return null
                                return (
                                  <div key={section}>
                                    <Separator />
                                    <div className="space-y-2 pt-4">
                                      <p className="text-sm font-medium text-muted-foreground capitalize">
                                        {section}
                                      </p>
                                      {fields.map(([key, value]) =>
                                        renderPreviewField(key, value),
                                      )}
                                    </div>
                                  </div>
                                )
                              },
                            )}
                          </>
                        )
                      })()}

                      <Separator />

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Status
                        </span>
                        <Badge variant="outline">Draft</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              }}
            </form.Subscribe>

            {/* Companions Preview */}
            {companions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Companions ({companions.length})
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {companions.map((companion) => (
                    <div
                      key={companion._id}
                      className="flex items-center justify-between rounded-lg border p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {companion.name || "Unnamed"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {companion.category}
                        </p>
                      </div>
                      {companion.gender && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {companion.gender}
                        </span>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
      <UnsavedChangesDialog blocker={blocker} />
    </div>
  )
}
