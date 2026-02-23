import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AlertTriangle, Mail, MapPin, User } from "lucide-react"
import {
  type HumanCreate,
  type HumanPublic,
  HumansService,
  type HumanUpdate,
} from "@/client"
import { FieldError } from "@/components/Common/FieldError"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import {
  UnsavedChangesDialog,
  useUnsavedChanges,
} from "@/hooks/useUnsavedChanges"
import { createErrorHandler } from "@/utils"

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non Binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

const AGE_OPTIONS = [
  { value: "under_18", label: "Under 18" },
  { value: "18_24", label: "18-24" },
  { value: "25_34", label: "25-34" },
  { value: "35_44", label: "35-44" },
  { value: "45_54", label: "45-54" },
  { value: "55_plus", label: "55+" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

interface HumanFormProps {
  defaultValues?: HumanPublic
  onSuccess: () => void
}

export function HumanForm({ defaultValues, onSuccess }: HumanFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { isAdmin } = useAuth()
  const isEdit = !!defaultValues
  const readOnly = !isAdmin

  const updateMutation = useMutation({
    mutationFn: (data: HumanUpdate) =>
      HumansService.updateHuman({
        humanId: defaultValues!.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Human updated successfully")
      queryClient.invalidateQueries({ queryKey: ["humans"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const createMutation = useMutation({
    mutationFn: (data: HumanCreate) =>
      HumansService.createHuman({
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Human created successfully")
      queryClient.invalidateQueries({ queryKey: ["humans"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const form = useForm({
    defaultValues: {
      email: defaultValues?.email ?? "",
      first_name: defaultValues?.first_name ?? "",
      last_name: defaultValues?.last_name ?? "",
      telegram: defaultValues?.telegram ?? "",
      organization: defaultValues?.organization ?? "",
      role: defaultValues?.role ?? "",
      gender: defaultValues?.gender ?? "",
      age: defaultValues?.age ?? "",
      residence: defaultValues?.residence ?? "",
      picture_url: defaultValues?.picture_url ?? "",
      red_flag: defaultValues?.red_flag ?? false,
    },
    onSubmit: ({ value }) => {
      if (isEdit) {
        updateMutation.mutate({
          first_name: value.first_name || null,
          last_name: value.last_name || null,
          telegram: value.telegram || null,
          organization: value.organization || null,
          role: value.role || null,
          gender: value.gender || null,
          age: value.age || null,
          residence: value.residence || null,
          picture_url: value.picture_url || null,
          red_flag: value.red_flag,
        })
      } else {
        createMutation.mutate({
          email: value.email,
          first_name: value.first_name || null,
          last_name: value.last_name || null,
          telegram: value.telegram || null,
          organization: value.organization || null,
          role: value.role || null,
          gender: value.gender || null,
          age: value.age || null,
          residence: value.residence || null,
          picture_url: value.picture_url || null,
        })
      }
    },
  })

  const blocker = useUnsavedChanges(form)

  const isPending = updateMutation.isPending || createMutation.isPending

  return (
    <div className="space-y-6">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Form Fields */}
          <div className="space-y-6 lg:col-span-2">
            {/* Email (only for create mode) */}
            {!isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Email address for the human (required)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Email is required"
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                          return "Invalid email format"
                        return undefined
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Email *</Label>
                        <Input
                          id={field.name}
                          type="email"
                          placeholder="john@example.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>
            )}

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  {readOnly
                    ? "View profile information (read-only)"
                    : isEdit
                      ? "Update the human's profile information"
                      : "Enter the human's profile information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="first_name">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>First Name</Label>
                        <Input
                          id={field.name}
                          placeholder="John"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="last_name">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Last Name</Label>
                        <Input
                          id={field.name}
                          placeholder="Doe"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="gender">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Gender</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(val) => field.handleChange(val)}
                          disabled={readOnly}
                        >
                          <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="age">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Age</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(val) => field.handleChange(val)}
                          disabled={readOnly}
                        >
                          <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select age range" />
                          </SelectTrigger>
                          <SelectContent>
                            {AGE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>
                </div>

                <form.Field name="residence">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Residence</Label>
                      <Input
                        id={field.name}
                        placeholder="City, Country"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </form.Field>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>Work and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="organization">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Organization</Label>
                        <Input
                          id={field.name}
                          placeholder="Company name"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="role">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Role</Label>
                        <Input
                          id={field.name}
                          placeholder="Developer, Designer, etc."
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="telegram">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Telegram</Label>
                        <Input
                          id={field.name}
                          placeholder="@username"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="picture_url">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Picture URL</Label>
                        <Input
                          id={field.name}
                          placeholder="https://..."
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
              </CardContent>
            </Card>

            {/* Status (only for edit mode) */}
            {isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>User flags and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <form.Field name="red_flag">
                    {(field) => (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor={field.name}>Red Flag</Label>
                          <p className="text-sm text-muted-foreground">
                            Mark this user as flagged for review
                          </p>
                        </div>
                        <Switch
                          id={field.name}
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked)
                          }
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>
            )}

            {/* Form Actions */}
            {(isAdmin || !isEdit) && (
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/humans" })}
                >
                  Cancel
                </Button>
                <LoadingButton type="submit" loading={isPending}>
                  {isEdit ? "Save Changes" : "Create Human"}
                </LoadingButton>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <form.Subscribe
              selector={(state) => ({
                email: state.values.email,
                first_name: state.values.first_name,
                last_name: state.values.last_name,
                organization: state.values.organization,
                role: state.values.role,
                residence: state.values.residence,
                picture_url: state.values.picture_url,
                red_flag: state.values.red_flag,
              })}
            >
              {(values) => (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Preview</CardTitle>
                    <CardDescription>Profile overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      {values.picture_url ? (
                        <img
                          src={values.picture_url}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium leading-none">
                            {[values.first_name, values.last_name]
                              .filter(Boolean)
                              .join(" ") || "Name"}
                          </p>
                          {values.red_flag && (
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {values.role || "Role"}{" "}
                          {values.organization && `at ${values.organization}`}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{defaultValues?.email || values.email || "—"}</span>
                    </div>

                    {values.residence && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{values.residence}</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        variant={values.red_flag ? "destructive" : "default"}
                      >
                        {values.red_flag ? "Flagged" : "Normal"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form.Subscribe>

            {isEdit && defaultValues && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Human Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{defaultValues.email}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Human ID</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {defaultValues.id}
                    </p>
                  </div>
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
