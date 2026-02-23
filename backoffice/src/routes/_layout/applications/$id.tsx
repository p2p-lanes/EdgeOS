import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Check, Circle } from "lucide-react"
import { Suspense } from "react"

import { type ApplicationPublic, ApplicationsService } from "@/client"
import { ApplicationDetail } from "@/components/ApplicationDetail"
import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_layout/applications/$id")({
  component: ViewApplicationPage,
  head: () => ({
    meta: [{ title: "Application Details - EdgeOS" }],
  }),
})

function getApplicationQueryOptions(applicationId: string) {
  return {
    queryKey: ["applications", applicationId],
    queryFn: () => ApplicationsService.getApplication({ applicationId }),
  }
}

function ApplicationStatusStepper({
  application,
}: {
  application: ApplicationPublic
}) {
  const status = application.status

  const steps = [
    {
      label: "Submitted",
      date: application.submitted_at,
      completed:
        status === "in review" ||
        status === "accepted" ||
        status === "rejected",
      active: status === "draft" || status === "in review",
    },
    {
      label: "In Review",
      date: null,
      completed: status === "accepted" || status === "rejected",
      active: status === "in review",
    },
    {
      label: status === "rejected" ? "Rejected" : "Accepted",
      date: application.accepted_at,
      completed: status === "accepted" || status === "rejected",
      active: false,
    },
  ]

  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((step, idx) => (
        <div
          key={step.label}
          className="flex items-center flex-1 last:flex-none"
        >
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                step.completed
                  ? status === "rejected" && idx === steps.length - 1
                    ? "border-destructive bg-destructive text-destructive-foreground"
                    : "border-primary bg-primary text-primary-foreground"
                  : step.active
                    ? "border-primary text-primary"
                    : "border-muted-foreground/30 text-muted-foreground/30"
              }`}
            >
              {step.completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                step.completed || step.active
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              }`}
            >
              {step.label}
            </span>
            {step.date && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(step.date).toLocaleDateString()}
              </span>
            )}
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-2 mt-[-20px] ${
                steps[idx + 1].completed || steps[idx + 1].active
                  ? "bg-primary"
                  : "bg-muted-foreground/20"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function ViewApplicationContent({ applicationId }: { applicationId: string }) {
  const { data: application, refetch } = useSuspenseQuery(
    getApplicationQueryOptions(applicationId),
  )

  return (
    <ApplicationDetail
      application={application}
      onReviewSuccess={() => refetch()}
      headerExtra={
        <>
          {/* Metadata */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            {application.submitted_at && (
              <div>
                <span className="text-xs uppercase tracking-wider">
                  Submitted
                </span>
                <p>{new Date(application.submitted_at).toLocaleDateString()}</p>
              </div>
            )}
            {application.accepted_at && (
              <div>
                <span className="text-xs uppercase tracking-wider">
                  Accepted
                </span>
                <p>{new Date(application.accepted_at).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <span className="text-xs uppercase tracking-wider">ID</span>
              <p className="font-mono text-xs">{application.id}</p>
            </div>
          </div>

          {/* Stepper */}
          {application.status !== "draft" && (
            <ApplicationStatusStepper application={application} />
          )}
        </>
      }
    />
  )
}

function ViewApplicationPage() {
  const { id } = Route.useParams()

  return (
    <FormPageLayout
      title="Application Details"
      description="View application information and submit reviews"
      backTo="/applications"
    >
      <QueryErrorBoundary>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <ViewApplicationContent applicationId={id} />
        </Suspense>
      </QueryErrorBoundary>
    </FormPageLayout>
  )
}
