import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, Inbox } from "lucide-react"
import { useState } from "react"

import { type ApplicationPublic, ApplicationReviewsService } from "@/client"
import { ApplicationDetail } from "@/components/ApplicationDetail"
import { EmptyState } from "@/components/Common/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/applications/review-queue")({
  component: ReviewQueuePage,
  head: () => ({
    meta: [{ title: "Review Queue - EdgeOS" }],
  }),
})

function ReviewQueuePage() {
  const { isContextReady, selectedPopupId } = useWorkspace()
  const { isAdmin } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const queryClient = useQueryClient()

  const { data: pendingData, isLoading } = useQuery({
    queryKey: ["pending-reviews", selectedPopupId],
    queryFn: () =>
      ApplicationReviewsService.listPendingReviews({
        popupId: selectedPopupId || undefined,
        skip: 0,
        limit: 100,
      }),
    enabled: isContextReady && isAdmin,
  })

  const applications = (pendingData?.results ??
    []) as unknown as ApplicationPublic[]
  const total = applications.length
  const current = applications[currentIndex]

  if (!isContextReady || !isAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
          <p className="text-muted-foreground">
            Select a popup and sign in as admin to review applications
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
          <p className="text-muted-foreground">
            Loading pending applications...
          </p>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
            <p className="text-muted-foreground">
              Review applications one by one
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/applications" search={{}}>
              Back to Applications
            </Link>
          </Button>
        </div>
        <EmptyState
          icon={Inbox}
          title="All caught up!"
          description="There are no applications pending your review."
          action={
            <Button variant="outline" asChild>
              <Link to="/applications" search={{}}>
                View All Applications
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const handleReviewed = () => {
    queryClient.invalidateQueries({ queryKey: ["pending-reviews"] })
    queryClient.invalidateQueries({ queryKey: ["applications"] })
    setCurrentIndex((i) => Math.min(i, total - 2 < 0 ? 0 : total - 2))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
          <p className="text-muted-foreground">
            Application {currentIndex + 1} of {total} pending review
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/applications" search={{}}>
            Back to List
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {total}
          </span>
          <div className="h-1.5 w-32 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
          disabled={currentIndex >= total - 1}
        >
          Next
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <ApplicationDetail
        application={current}
        onReviewSuccess={handleReviewed}
        headerExtra={
          current.submitted_at ? (
            <p className="text-xs text-muted-foreground">
              Submitted {new Date(current.submitted_at).toLocaleDateString()}
            </p>
          ) : null
        }
      />
    </div>
  )
}
