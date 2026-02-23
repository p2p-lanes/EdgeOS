import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, Info, ShieldCheck, Trash2 } from "lucide-react"
import type * as React from "react"
import { useState } from "react"

import {
  type ApiError,
  ApprovalStrategiesService,
  type ApprovalStrategyCreate,
  type ApprovalStrategyPublic,
} from "@/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { InlineRow } from "@/components/ui/inline-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import useCustomToast from "@/hooks/useCustomToast"
import { cn } from "@/lib/utils"
import { createErrorHandler } from "@/utils"

interface ApprovalStrategyFormProps {
  popupId: string
  readOnly?: boolean
  variant?: "card" | "inline"
}

const STRATEGY_TYPES = [
  {
    value: "auto_accept",
    label: "Auto Accept",
    description: "Applications are automatically accepted on submission",
  },
  {
    value: "any_reviewer",
    label: "Any Reviewer",
    description: "Any single designated reviewer can accept an application",
  },
  {
    value: "all_reviewers",
    label: "All Reviewers",
    description: "All required reviewers must approve for acceptance",
  },
  {
    value: "threshold",
    label: "Threshold",
    description: "A specific number of approvals is required",
  },
  {
    value: "weighted",
    label: "Weighted Voting",
    description:
      "Reviewers vote with different weights (strong yes, yes, no, strong no)",
  },
] as const

type StrategyType = (typeof STRATEGY_TYPES)[number]["value"]

export function ApprovalStrategyForm({
  popupId,
  readOnly = false,
  variant = "card",
}: ApprovalStrategyFormProps) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const {
    data: strategy,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["approval-strategy", popupId],
    queryFn: () => ApprovalStrategiesService.getApprovalStrategy({ popupId }),
    retry: false,
  })

  // Check if no strategy exists (404 error)
  const hasNoStrategy = !strategy && (error as ApiError)?.status === 404

  const saveMutation = useMutation({
    mutationFn: (data: ApprovalStrategyCreate) =>
      ApprovalStrategiesService.createOrUpdateApprovalStrategy({
        popupId,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Approval strategy saved")
      queryClient.invalidateQueries({
        queryKey: ["approval-strategy", popupId],
      })
    },
    onError: (err) => createErrorHandler(showErrorToast)(err as ApiError),
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      ApprovalStrategiesService.deleteApprovalStrategy({ popupId }),
    onSuccess: () => {
      showSuccessToast("Approval strategy removed (auto-accept enabled)")
      queryClient.invalidateQueries({
        queryKey: ["approval-strategy", popupId],
      })
    },
    onError: (err) => createErrorHandler(showErrorToast)(err as ApiError),
  })

  if (isLoading) {
    return (
      <SectionShell
        variant={variant}
        title="Application Review"
        description="Loading..."
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </SectionShell>
    )
  }

  // No strategy configured - show simple state with option to enable
  if (hasNoStrategy) {
    return (
      <SectionShell
        variant={variant}
        title="Application Review"
        description="Configure how applications are reviewed before acceptance"
      >
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Applications are currently <strong>auto-accepted</strong> when
              submitted. Configure a review strategy below to require manual
              approval.
            </AlertDescription>
          </Alert>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                saveMutation.mutate({ strategy_type: "any_reviewer" })
              }
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending
                ? "Enabling..."
                : "Enable Application Review"}
            </Button>
          )}
        </div>
      </SectionShell>
    )
  }

  // Strategy exists - render the form with loaded data
  return (
    <ApprovalStrategyFormInner
      variant={variant}
      strategy={strategy!}
      readOnly={readOnly}
      onSave={(data) => saveMutation.mutate(data)}
      onDelete={() => deleteMutation.mutate()}
      isSaving={saveMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  )
}

// Inner component that only renders when strategy data is available
function ApprovalStrategyFormInner({
  variant = "card",
  strategy,
  readOnly,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: {
  variant?: "card" | "inline"
  strategy: ApprovalStrategyPublic
  readOnly: boolean
  onSave: (data: ApprovalStrategyCreate) => void
  onDelete: () => void
  isSaving: boolean
  isDeleting: boolean
}) {
  const form = useForm({
    defaultValues: {
      strategy_type: strategy.strategy_type as StrategyType,
      required_approvals: strategy.required_approvals,
      accept_threshold: strategy.accept_threshold,
      reject_threshold: strategy.reject_threshold,
      strong_yes_weight: strategy.strong_yes_weight,
      yes_weight: strategy.yes_weight,
      no_weight: strategy.no_weight,
      strong_no_weight: strategy.strong_no_weight,
    },
    onSubmit: ({ value }) => {
      if (readOnly) return
      onSave(value)
    },
  })

  // Auto-save on blur
  const handleFieldBlur = () => {
    if (!readOnly) {
      form.handleSubmit()
    }
  }

  const strategyType = form.getFieldValue("strategy_type")
  const selectedStrategy = STRATEGY_TYPES.find((s) => s.value === strategyType)

  return (
    <SectionShell
      variant={variant}
      title="Application Review"
      description="Configure how applications are reviewed and accepted"
      action={
        !readOnly ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Disable Review
          </Button>
        ) : undefined
      }
    >
      {variant === "inline" ? (
        <InlineStrategyFields
          form={form}
          strategyType={strategyType}
          selectedStrategy={selectedStrategy}
          readOnly={readOnly}
          handleFieldBlur={handleFieldBlur}
          isSaving={isSaving}
        />
      ) : (
        <div className="space-y-6">
          {/* Strategy Type */}
          <form.Field name="strategy_type">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="strategy_type">Review Strategy</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value as StrategyType)
                    setTimeout(() => form.handleSubmit(), 0)
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger id="strategy_type">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {STRATEGY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStrategy && (
                  <p className="text-sm text-muted-foreground">
                    {selectedStrategy.description}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {strategyType === "auto_accept" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                All applications will be automatically accepted when submitted.
                No manual review is required.
              </AlertDescription>
            </Alert>
          )}

          {strategyType === "threshold" && (
            <form.Field name="required_approvals">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="required_approvals">Required Approvals</Label>
                  <Input
                    id="required_approvals"
                    type="number"
                    min={1}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={handleFieldBlur}
                    disabled={readOnly}
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of reviewer approvals needed to accept an application
                  </p>
                </div>
              )}
            </form.Field>
          )}

          {strategyType === "weighted" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="accept_threshold">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="accept_threshold">Accept Threshold</Label>
                      <Input
                        id="accept_threshold"
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        onBlur={handleFieldBlur}
                        disabled={readOnly}
                      />
                      <p className="text-sm text-muted-foreground">
                        Points needed to accept
                      </p>
                    </div>
                  )}
                </form.Field>

                <form.Field name="reject_threshold">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="reject_threshold">Reject Threshold</Label>
                      <Input
                        id="reject_threshold"
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        onBlur={handleFieldBlur}
                        disabled={readOnly}
                      />
                      <p className="text-sm text-muted-foreground">
                        Points to reject (negative)
                      </p>
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="strong_yes_weight">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="strong_yes_weight">
                        Strong Yes Weight
                      </Label>
                      <Input
                        id="strong_yes_weight"
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        onBlur={handleFieldBlur}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="yes_weight">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="yes_weight">Yes Weight</Label>
                      <Input
                        id="yes_weight"
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        onBlur={handleFieldBlur}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="no_weight">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="no_weight">No Weight</Label>
                      <Input
                        id="no_weight"
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        onBlur={handleFieldBlur}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="strong_no_weight">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="strong_no_weight">Strong No Weight</Label>
                      <Input
                        id="strong_no_weight"
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        onBlur={handleFieldBlur}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </>
          )}

          {isSaving && (
            <p className="text-sm text-muted-foreground">Saving...</p>
          )}
        </div>
      )}
    </SectionShell>
  )
}

function InlineStrategyFields({
  form,
  strategyType,
  selectedStrategy,
  readOnly,
  handleFieldBlur,
  isSaving,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: private component, form type is inferred from parent
  form: any
  strategyType: StrategyType
  selectedStrategy: (typeof STRATEGY_TYPES)[number] | undefined
  readOnly: boolean
  handleFieldBlur: () => void
  isSaving: boolean
}) {
  const [configOpen, setConfigOpen] = useState(false)
  const hasConfig = strategyType === "threshold" || strategyType === "weighted"

  return (
    <div className="divide-y divide-border">
      {/* Strategy Type */}
      <form.Field name="strategy_type">
        {(field: any) => (
          <InlineRow
            icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
            label="Review Strategy"
            description={selectedStrategy?.description}
          >
            <Select
              value={field.state.value}
              onValueChange={(value) => {
                field.handleChange(value as StrategyType)
                setTimeout(() => form.handleSubmit(), 0)
              }}
              disabled={readOnly}
            >
              <SelectTrigger className="w-auto text-sm">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                {STRATEGY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </InlineRow>
        )}
      </form.Field>

      {/* Auto Accept Info */}
      {strategyType === "auto_accept" && (
        <div className="py-3">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              All applications will be automatically accepted. No manual review
              required.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Collapsible config for threshold / weighted */}
      {hasConfig && (
        <div className="py-3">
          <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    configOpen && "rotate-180",
                  )}
                />
                Configure{" "}
                {strategyType === "threshold" ? "threshold" : "weights"}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 space-y-4 rounded-lg border bg-muted/30 p-4">
                {/* Threshold */}
                {strategyType === "threshold" && (
                  <form.Field name="required_approvals">
                    {(field: any) => (
                      <div className="space-y-1">
                        <Label
                          htmlFor="required_approvals"
                          className="text-xs text-muted-foreground"
                        >
                          Required Approvals
                        </Label>
                        <Input
                          id="required_approvals"
                          type="number"
                          min={1}
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          onBlur={handleFieldBlur}
                          disabled={readOnly}
                          className="h-8 max-w-24 text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Approvals needed to accept an application
                        </p>
                      </div>
                    )}
                  </form.Field>
                )}

                {/* Weighted */}
                {strategyType === "weighted" && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Thresholds
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <form.Field name="accept_threshold">
                          {(field: any) => (
                            <div className="space-y-1">
                              <Label
                                htmlFor="accept_threshold"
                                className="text-xs text-muted-foreground"
                              >
                                Accept
                              </Label>
                              <Input
                                id="accept_threshold"
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                onBlur={handleFieldBlur}
                                disabled={readOnly}
                                className="h-8 max-w-24 text-sm"
                              />
                            </div>
                          )}
                        </form.Field>
                        <form.Field name="reject_threshold">
                          {(field: any) => (
                            <div className="space-y-1">
                              <Label
                                htmlFor="reject_threshold"
                                className="text-xs text-muted-foreground"
                              >
                                Reject
                              </Label>
                              <Input
                                id="reject_threshold"
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                onBlur={handleFieldBlur}
                                disabled={readOnly}
                                className="h-8 max-w-24 text-sm"
                              />
                            </div>
                          )}
                        </form.Field>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Vote Weights
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        <form.Field name="strong_yes_weight">
                          {(field: any) => (
                            <div className="space-y-1">
                              <Label
                                htmlFor="strong_yes_weight"
                                className="text-xs text-muted-foreground"
                              >
                                Strong Yes
                              </Label>
                              <Input
                                id="strong_yes_weight"
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                onBlur={handleFieldBlur}
                                disabled={readOnly}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </form.Field>
                        <form.Field name="yes_weight">
                          {(field: any) => (
                            <div className="space-y-1">
                              <Label
                                htmlFor="yes_weight"
                                className="text-xs text-muted-foreground"
                              >
                                Yes
                              </Label>
                              <Input
                                id="yes_weight"
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                onBlur={handleFieldBlur}
                                disabled={readOnly}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </form.Field>
                        <form.Field name="no_weight">
                          {(field: any) => (
                            <div className="space-y-1">
                              <Label
                                htmlFor="no_weight"
                                className="text-xs text-muted-foreground"
                              >
                                No
                              </Label>
                              <Input
                                id="no_weight"
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                onBlur={handleFieldBlur}
                                disabled={readOnly}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </form.Field>
                        <form.Field name="strong_no_weight">
                          {(field: any) => (
                            <div className="space-y-1">
                              <Label
                                htmlFor="strong_no_weight"
                                className="text-xs text-muted-foreground"
                              >
                                Strong No
                              </Label>
                              <Input
                                id="strong_no_weight"
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                onBlur={handleFieldBlur}
                                disabled={readOnly}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </form.Field>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {isSaving && (
        <div className="py-3">
          <p className="text-sm text-muted-foreground">Saving...</p>
        </div>
      )}
    </div>
  )
}

function SectionShell({
  variant,
  title,
  description,
  action,
  children,
}: {
  variant: "card" | "inline"
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  if (variant === "inline") {
    return (
      <div className="space-y-4">
        <div
          className={cn("flex items-start justify-between", action && "gap-4")}
        >
          <div className="space-y-1">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
        {children}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div
          className={cn("flex items-start justify-between", action && "gap-4")}
        >
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
