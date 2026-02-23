import { useMutation, useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Building,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react"
import { type ReactNode, useState } from "react"

import {
  type ApiError,
  type ApplicationPublic,
  ApplicationReviewsService,
  ApprovalStrategiesService,
  FormFieldsService,
  type ReviewDecision,
} from "@/client"
import { StatusBadge } from "@/components/Common/StatusBadge"
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
import { InlineRow, InlineSection } from "@/components/ui/inline-form"
import { LoadingButton } from "@/components/ui/loading-button"
import { Separator } from "@/components/ui/separator"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { cn } from "@/lib/utils"
import { createErrorHandler } from "@/utils"

// ========================
// Types
// ========================

interface FormFieldSchema {
  type: string
  label: string
  required: boolean
  section: string
  position?: number
  options?: string[]
  placeholder?: string
  help_text?: string
}

interface ApplicationSchema {
  base_fields: Record<string, FormFieldSchema>
  custom_fields: Record<string, FormFieldSchema>
  sections: string[]
}

// ========================
// Voting Components
// ========================

function WeightedVoting({
  application,
  onSuccess,
}: {
  application: ApplicationPublic
  onSuccess: () => void
}) {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [selectedDecision, setSelectedDecision] =
    useState<ReviewDecision | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (decision: ReviewDecision) =>
      ApplicationReviewsService.submitReview({
        applicationId: application.id,
        requestBody: { decision },
      }),
    onSuccess: (_, decision) => {
      showSuccessToast(`Review submitted: ${decision.replace("_", " ")}`)
      setDialogOpen(false)
      setSelectedDecision(null)
      onSuccess()
    },
    onError: (err) => createErrorHandler(showErrorToast)(err as ApiError),
  })

  const handleVote = (decision: ReviewDecision) => {
    setSelectedDecision(decision)
    setDialogOpen(true)
  }

  const labels: Record<ReviewDecision, string> = {
    strong_yes: "Strong Yes",
    yes: "Yes",
    no: "No",
    strong_no: "Strong No",
  }

  return (
    <>
      <div className="space-y-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Cast Your Vote
        </p>
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-green-600 hover:bg-green-50 hover:text-green-700"
            onClick={() => handleVote("strong_yes")}
          >
            <ChevronUp className="h-3.5 w-3.5" />
            <ChevronUp className="-ml-2 h-3.5 w-3.5" />
            Strong Yes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-green-600 hover:bg-green-50 hover:text-green-700"
            onClick={() => handleVote("yes")}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            Yes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleVote("no")}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            No
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleVote("strong_no")}
          >
            <ChevronDown className="h-3.5 w-3.5" />
            <ChevronDown className="-ml-2 h-3.5 w-3.5" />
            Strong No
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm Vote: {selectedDecision && labels[selectedDecision]}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to vote "
              {selectedDecision && labels[selectedDecision]}" for the
              application from "{application.human?.first_name}{" "}
              {application.human?.last_name}"? This will submit your review and
              may update the application status.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <LoadingButton
              variant={
                selectedDecision === "no" || selectedDecision === "strong_no"
                  ? "destructive"
                  : "default"
              }
              loading={mutation.isPending}
              onClick={() =>
                selectedDecision && mutation.mutate(selectedDecision)
              }
            >
              Submit Vote
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SimpleVoting({
  application,
  onSuccess,
}: {
  application: ApplicationPublic
  onSuccess: () => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDecision, setPendingDecision] = useState<ReviewDecision | null>(
    null,
  )
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (decision: ReviewDecision) =>
      ApplicationReviewsService.submitReview({
        applicationId: application.id,
        requestBody: { decision },
      }),
    onSuccess: (_, decision) => {
      const action = decision === "yes" ? "Approved" : "Rejected"
      showSuccessToast(
        `${action}: ${application.human?.first_name} ${application.human?.last_name}`,
      )
      setDialogOpen(false)
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const handleClick = (decision: ReviewDecision) => {
    setPendingDecision(decision)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Review
        </p>
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            className="w-full justify-start"
            onClick={() => handleClick("yes")}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full justify-start"
            onClick={() => handleClick("no")}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingDecision === "yes" ? "Approve" : "Reject"} Application
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {pendingDecision === "yes" ? "approve" : "reject"} the application
              from "{application.human?.first_name}{" "}
              {application.human?.last_name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <LoadingButton
              variant={pendingDecision === "no" ? "destructive" : "default"}
              loading={mutation.isPending}
              onClick={() =>
                pendingDecision && mutation.mutate(pendingDecision)
              }
            >
              {pendingDecision === "yes" ? "Approve" : "Reject"}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ReviewSummary({
  summary,
}: {
  summary: {
    total_reviews: number
    weighted_score?: number | null
    reviews: Array<{
      id: string
      reviewer_full_name?: string | null
      reviewer_email?: string | null
      decision: string
      notes?: string | null
    }>
  }
}) {
  return (
    <InlineSection title={`Reviews (${summary.total_reviews})`}>
      {summary.reviews.map((review) => (
        <div key={review.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium">
              {review.reviewer_full_name || review.reviewer_email || "Unknown"}
            </p>
            {review.notes && (
              <p className="text-xs text-muted-foreground">{review.notes}</p>
            )}
          </div>
          <StatusBadge status={review.decision} />
        </div>
      ))}
      {summary.weighted_score !== null &&
        summary.weighted_score !== undefined && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">
              Weighted Score
            </span>
            <span className="font-mono text-sm font-medium">
              {summary.weighted_score}
            </span>
          </div>
        )}
    </InlineSection>
  )
}

// ========================
// Main Component
// ========================

interface ApplicationDetailProps {
  application: ApplicationPublic
  onReviewSuccess: () => void
  headerExtra?: ReactNode
}

export function ApplicationDetail({
  application,
  onReviewSuccess,
  headerExtra,
}: ApplicationDetailProps) {
  const { isAdmin } = useAuth()

  const { data: schema } = useQuery({
    queryKey: ["form-fields-schema", application.popup_id],
    queryFn: async () => {
      const result = await FormFieldsService.getApplicationSchema({
        popupId: application.popup_id,
      })
      return result as unknown as ApplicationSchema
    },
  })

  const { data: reviewSummary, refetch: refetchReviews } = useQuery({
    queryKey: ["review-summary", application.id],
    queryFn: () =>
      ApplicationReviewsService.getReviewSummary({
        applicationId: application.id,
      }),
    enabled: application.status !== "draft",
  })

  const { data: approvalStrategy } = useQuery({
    queryKey: ["approval-strategy", application.popup_id],
    queryFn: () =>
      ApprovalStrategiesService.getApprovalStrategy({
        popupId: application.popup_id,
      }),
    retry: false,
  })

  const isWeightedVoting = approvalStrategy?.strategy_type === "weighted"
  const canReview = isAdmin && application.status === "in review"
  const companions =
    application.attendees?.filter((a) => a.category !== "main") ?? []

  const handleReviewSuccess = () => {
    refetchReviews()
    onReviewSuccess()
  }

  const getFieldLabel = (fieldName: string): string => {
    if (schema?.custom_fields?.[fieldName]?.label) {
      return schema.custom_fields[fieldName].label
    }
    return fieldName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatFieldValue = (fieldName: string, value: unknown): string => {
    if (value === null || value === undefined) return "—"
    const fieldDef = schema?.custom_fields?.[fieldName]
    const fieldType = fieldDef?.type
    if (fieldType === "boolean") return value ? "Yes" : "No"
    if (fieldType === "multiselect" && Array.isArray(value))
      return value.join(", ")
    if (fieldType === "date" && typeof value === "string") {
      return new Date(value).toLocaleDateString()
    }
    return String(value)
  }

  const getCustomFieldsBySection = () => {
    if (
      !application.custom_fields ||
      Object.keys(application.custom_fields).length === 0
    ) {
      return {
        unsectioned: [] as [string, unknown][],
        sectioned: {} as Record<string, [string, unknown][]>,
      }
    }
    const entries = Object.entries(application.custom_fields)
    const sorted = schema?.custom_fields
      ? entries.sort(([a], [b]) => {
          const posA = schema.custom_fields[a]?.position ?? 0
          const posB = schema.custom_fields[b]?.position ?? 0
          return posA - posB
        })
      : entries
    const unsectioned: [string, unknown][] = []
    const sectioned: Record<string, [string, unknown][]> = {}
    for (const [key, value] of sorted) {
      const section = schema?.custom_fields?.[key]?.section
      if (section) {
        if (!sectioned[section]) sectioned[section] = []
        sectioned[section].push([key, value])
      } else {
        unsectioned.push([key, value])
      }
    }
    return { unsectioned, sectioned }
  }

  const {
    unsectioned: unsectionedCustomFields,
    sectioned: sectionedCustomFields,
  } = getCustomFieldsBySection()

  const votingPanel = isWeightedVoting ? (
    <WeightedVoting application={application} onSuccess={handleReviewSuccess} />
  ) : (
    <SimpleVoting application={application} onSuccess={handleReviewSuccess} />
  )

  const hasReviews =
    application.status !== "draft" &&
    reviewSummary &&
    reviewSummary.total_reviews > 0

  return (
    <div
      className={cn(
        "mx-auto",
        canReview ? "flex max-w-5xl gap-8" : "max-w-2xl",
      )}
    >
      {/* Main content */}
      <div
        className={cn(
          "min-w-0 space-y-6",
          canReview ? "max-w-2xl flex-1" : "w-full",
        )}
      >
        {/* Hero */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-3xl font-semibold">
              {application.human?.first_name} {application.human?.last_name}
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              {application.red_flag && (
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Flagged
                </Badge>
              )}
              <StatusBadge status={application.status} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {application.human?.email}
          </p>
        </div>

        {headerExtra}

        {/* Mobile action panel */}
        {canReview && (
          <div className="space-y-4 lg:hidden">
            {votingPanel}
            {hasReviews && <ReviewSummary summary={reviewSummary} />}
            <Separator />
          </div>
        )}

        <Separator className={cn(canReview && "hidden lg:block")} />

        {/* Review summary (when not reviewer but reviews exist) */}
        {!canReview && hasReviews && (
          <>
            <ReviewSummary summary={reviewSummary} />
            <Separator />
          </>
        )}

        {/* Applicant */}
        <InlineSection title="Applicant">
          {application.human?.organization && (
            <InlineRow
              icon={<Building className="h-4 w-4 text-muted-foreground" />}
              label="Organization"
            >
              <span className="text-sm">{application.human.organization}</span>
            </InlineRow>
          )}
          {application.human?.role && (
            <InlineRow
              icon={<User className="h-4 w-4 text-muted-foreground" />}
              label="Role"
            >
              <span className="text-sm">{application.human.role}</span>
            </InlineRow>
          )}
          {application.human?.residence && (
            <InlineRow
              icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
              label="Residence"
            >
              <span className="text-sm">{application.human.residence}</span>
            </InlineRow>
          )}
          {application.human?.telegram && (
            <InlineRow
              icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
              label="Telegram"
            >
              <span className="text-sm">{application.human.telegram}</span>
            </InlineRow>
          )}
          {application.human?.gender && (
            <InlineRow label="Gender">
              <span className="text-sm capitalize">
                {application.human.gender}
              </span>
            </InlineRow>
          )}
          {application.human?.age && (
            <InlineRow label="Age Range">
              <span className="text-sm">{application.human.age}</span>
            </InlineRow>
          )}
          {application.referral && (
            <InlineRow label="Referral">
              <span className="text-sm">{application.referral}</span>
            </InlineRow>
          )}
        </InlineSection>

        {/* Unsectioned custom fields */}
        {unsectionedCustomFields.length > 0 && (
          <>
            <Separator />
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {unsectionedCustomFields.map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground">
                    {getFieldLabel(key)}
                  </p>
                  <p className="text-sm">{formatFieldValue(key, value)}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sectioned custom fields */}
        {Object.entries(sectionedCustomFields).map(([section, fields]) => (
          <div key={section}>
            <Separator />
            <InlineSection title={section} className="capitalize pt-4">
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 py-3">
                {fields.map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground">
                      {getFieldLabel(key)}
                    </p>
                    <p className="text-sm">{formatFieldValue(key, value)}</p>
                  </div>
                ))}
              </div>
            </InlineSection>
          </div>
        ))}

        {/* Companions */}
        {companions.length > 0 && (
          <>
            <Separator />
            <InlineSection title={`Companions (${companions.length})`}>
              {companions.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{attendee.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {attendee.email} ·{" "}
                      <span className="capitalize">{attendee.category}</span>
                    </p>
                  </div>
                  <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                    {attendee.check_in_code}
                  </code>
                </div>
              ))}
            </InlineSection>
          </>
        )}
      </div>

      {/* Desktop action panel */}
      {canReview && (
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 space-y-6">
            {votingPanel}
            {hasReviews && <ReviewSummary summary={reviewSummary} />}
          </div>
        </aside>
      )}
    </div>
  )
}
