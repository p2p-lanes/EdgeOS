import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  ListChecks,
  RefreshCw,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react"

import {
  type ApplicationPublic,
  ApplicationReviewsService,
  DashboardService,
  type PaymentPublic,
  PaymentsService,
} from "@/client"
import { StatusBadge } from "@/components/Common/StatusBadge"
import { WorkspaceAlert } from "@/components/Common/WorkspaceAlert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Dashboard - EdgeOS",
      },
    ],
  }),
})

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  isLoading,
  variant = "default",
}: {
  title: string
  value: number | string | undefined
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  isLoading: boolean
  variant?: "default" | "success" | "warning" | "danger"
}) {
  const variantStyles = {
    default: "text-muted-foreground",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  }

  const content = (
    <Card
      className={`h-full transition-colors ${href ? "hover:bg-muted/50 cursor-pointer" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value ?? 0}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link
        to={href}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    )
  }
  return content
}

function safeParseNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const n = Number.parseFloat(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function formatMoney(
  value: string | number | null | undefined,
  currency: string = "USD",
): string {
  const num = safeParseNumber(value)
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    // Fallback for invalid/unknown currency codes
    return `$${num.toFixed(2)}`
  }
}

function formatUpdatedAt(updatedAtMs: number): string {
  if (!updatedAtMs) return "—"
  const delta = Date.now() - updatedAtMs
  if (delta < 10_000) return "just now"
  const minutes = Math.floor(delta / 60_000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(delta / 3_600_000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(delta / 86_400_000)
  return `${days}d ago`
}

function Dashboard() {
  const { user: currentUser, isAdmin, isSuperadmin } = useAuth()
  const {
    selectedPopupId,
    selectedTenantId,
    isContextReady,
    needsPopupSelection,
  } = useWorkspace()

  // Fetch dashboard stats from dedicated endpoint
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["dashboard", "stats", selectedPopupId, selectedTenantId],
    queryFn: () =>
      DashboardService.getDashboardStats({
        popupId: selectedPopupId!,
        xTenantId: isSuperadmin ? selectedTenantId : undefined,
      }),
    enabled: isContextReady && !!selectedPopupId,
  })

  const applications = stats?.applications
  const attendees = stats?.attendees
  const payments = stats?.payments

  return (
    <div className="flex flex-col gap-6">
      {!isContextReady && <WorkspaceAlert resource="dashboard data" />}

      {isError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Failed to load dashboard stats: {error?.message || "Unknown error"}
        </div>
      )}

      {/* Welcome header */}
      <section aria-labelledby="dashboard-title" className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1
              id="dashboard-title"
              className="text-2xl font-bold tracking-tight truncate max-w-md"
            >
              Welcome back, {currentUser?.full_name || currentUser?.email}
            </h1>
            <p className="text-muted-foreground">
              Registration statistics overview
            </p>
            {needsPopupSelection && (
              <div className="mt-2 text-xs text-muted-foreground">
                Select a popup to view stats
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Updated {formatUpdatedAt(dataUpdatedAt)}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={!isContextReady || isFetching}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              {isFetching ? "Refreshing" : "Refresh"}
            </Button>
          </div>
        </div>
      </section>

      {/* Needs Attention */}
      {isContextReady && isAdmin && (
        <NeedsAttention
          inReview={applications?.in_review ?? 0}
          pendingPayments={payments?.pending ?? 0}
          isContextReady={isContextReady}
          selectedPopupId={selectedPopupId}
          isSuperadmin={isSuperadmin}
          selectedTenantId={selectedTenantId}
        />
      )}

      {/* Quick Actions for Admins */}
      {isAdmin && (
        <section aria-labelledby="dashboard-quick-actions">
          <h2
            id="dashboard-quick-actions"
            className="text-lg font-semibold mb-4"
          >
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/applications" search={{}}>
                <FileText className="mr-2 h-4 w-4" />
                Review Applications
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/attendees">
                <Users className="mr-2 h-4 w-4" />
                View Attendees
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/payments">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Payments
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Summary Cards */}
      <section
        aria-label="Dashboard summary"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Applications"
          value={applications?.total}
          subtitle={`${applications?.accepted ?? 0} accepted`}
          icon={FileText}
          href="/applications"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Attendees"
          value={attendees?.total}
          subtitle={`${attendees?.main ?? 0} main, ${attendees?.spouse ?? 0} spouse, ${attendees?.kid ?? 0} kids`}
          icon={Users}
          href="/attendees"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Payments"
          value={payments?.total}
          subtitle={`${payments?.approved ?? 0} approved`}
          icon={CreditCard}
          href="/payments"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={formatMoney(payments?.approved_revenue, "USD")}
          subtitle={`${formatMoney(payments?.pending_revenue, "USD")} pending`}
          icon={DollarSign}
          isLoading={isLoading}
          variant="success"
        />
      </section>

      {/* Detailed Breakdowns */}
      <section
        aria-label="Dashboard breakdowns"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Application Status Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Applications by Status
                </CardTitle>
                <CardDescription>Current application pipeline</CardDescription>
              </div>
              <Link
                to="/applications"
                search={{}}
                className="text-xs text-primary hover:underline whitespace-nowrap"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/applications"
                  search={{ status: "in review" }}
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">In Review</span>
                    </div>
                    <span className="text-sm font-bold">
                      {applications?.in_review ?? 0}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/applications"
                  search={{ status: "accepted" }}
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Accepted</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {applications?.accepted ?? 0}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/applications"
                  search={{ status: "rejected" }}
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      {applications?.rejected ?? 0}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/applications"
                  search={{ status: "draft" }}
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Draft</span>
                    </div>
                    <span className="text-sm font-bold">
                      {applications?.draft ?? 0}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/applications"
                  search={{ status: "withdrawn" }}
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Withdrawn</span>
                    </div>
                    <span className="text-sm font-bold">
                      {applications?.withdrawn ?? 0}
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendee Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Attendees by Category
                </CardTitle>
                <CardDescription>Registration breakdown</CardDescription>
              </div>
              <Link
                to="/attendees"
                className="text-xs text-primary hover:underline whitespace-nowrap"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/attendees"
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <span className="text-sm">Main Attendees</span>
                    <span className="text-sm font-bold">
                      {attendees?.main ?? 0}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/attendees"
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <span className="text-sm">Spouses</span>
                    <span className="text-sm font-bold">
                      {attendees?.spouse ?? 0}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/attendees"
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <span className="text-sm">Kids</span>
                    <span className="text-sm font-bold">
                      {attendees?.kid ?? 0}
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status & Revenue */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Payment Overview
                </CardTitle>
                <CardDescription>Revenue and payment status</CardDescription>
              </div>
              <Link
                to="/payments"
                className="text-xs text-primary hover:underline whitespace-nowrap"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/payments"
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-green-500/10 hover:bg-green-500/15 transition-colors">
                    <span className="text-sm">Approved Revenue</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatMoney(payments?.approved_revenue, "USD")}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/payments"
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-yellow-500/10 hover:bg-yellow-500/15 transition-colors">
                    <span className="text-sm">Pending Revenue</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {formatMoney(payments?.pending_revenue, "USD")}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/payments"
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <span className="text-sm">Total Discounts</span>
                    <span className="text-sm font-bold">
                      {formatMoney(payments?.total_discounts, "USD")}
                    </span>
                  </div>
                </Link>
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold">
                        {payments?.approved ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Approved
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {payments?.pending ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pending
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {payments?.rejected ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rejected
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-muted-foreground">
                        {(payments?.expired ?? 0) + (payments?.cancelled ?? 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Other</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity */}
      {isContextReady && isAdmin && selectedPopupId && (
        <RecentActivity
          isContextReady={isContextReady}
          selectedPopupId={selectedPopupId}
          isSuperadmin={isSuperadmin}
          selectedTenantId={selectedTenantId}
        />
      )}
    </div>
  )
}

function NeedsAttention({
  inReview,
  pendingPayments,
  isContextReady,
  selectedPopupId,
  isSuperadmin,
  selectedTenantId,
}: {
  inReview: number
  pendingPayments: number
  isContextReady: boolean
  selectedPopupId: string | null
  isSuperadmin: boolean
  selectedTenantId: string | null | undefined
}) {
  const tenantHeader = isSuperadmin ? selectedTenantId : undefined
  const { data: pendingReviews } = useQuery({
    queryKey: ["pending-reviews-count", selectedPopupId, tenantHeader],
    queryFn: () =>
      ApplicationReviewsService.listPendingReviews({
        popupId: selectedPopupId || undefined,
        skip: 0,
        limit: 1,
        xTenantId: tenantHeader,
      }),
    enabled: isContextReady && !!selectedPopupId,
  })

  const myPendingCount = pendingReviews?.paging?.total ?? 0
  const items = [
    {
      show: myPendingCount > 0,
      icon: ListChecks,
      label: `${myPendingCount} application${myPendingCount !== 1 ? "s" : ""} awaiting your review`,
      href: "/applications/review-queue",
      variant: "warning" as const,
    },
    {
      show: inReview > 0 && inReview !== myPendingCount,
      icon: Clock,
      label: `${inReview} application${inReview !== 1 ? "s" : ""} in review`,
      href: "/applications",
      variant: "default" as const,
    },
    {
      show: pendingPayments > 0,
      icon: CreditCard,
      label: `${pendingPayments} pending payment${pendingPayments !== 1 ? "s" : ""} to approve`,
      href: "/payments",
      variant: "warning" as const,
    },
  ].filter((item) => item.show)

  if (items.length === 0) return null

  return (
    <section aria-labelledby="needs-attention-title">
      <h2
        id="needs-attention-title"
        className="text-lg font-semibold mb-3 flex items-center gap-2"
      >
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        Needs Attention
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <item.icon
                  className={`h-5 w-5 shrink-0 ${item.variant === "warning" ? "text-yellow-500" : "text-muted-foreground"}`}
                />
                <span className="text-sm font-medium flex-1 line-clamp-2">
                  {item.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

function RecentActivity({
  isContextReady,
  selectedPopupId,
  isSuperadmin,
  selectedTenantId,
}: {
  isContextReady: boolean
  selectedPopupId: string
  isSuperadmin: boolean
  selectedTenantId: string | null | undefined
}) {
  const tenantHeader = isSuperadmin ? selectedTenantId : undefined

  const { data: recentApps, isLoading: isAppsLoading } = useQuery({
    queryKey: ["recent-applications", selectedPopupId, tenantHeader],
    queryFn: () =>
      ApplicationReviewsService.listPendingReviews({
        popupId: selectedPopupId,
        skip: 0,
        limit: 5,
        xTenantId: tenantHeader,
      }),
    enabled: isContextReady && !!selectedPopupId,
  })

  const { data: recentPayments, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["recent-payments", selectedPopupId, tenantHeader],
    queryFn: () =>
      PaymentsService.listPayments({
        popupId: selectedPopupId,
        skip: 0,
        limit: 5,
        xTenantId: tenantHeader,
      }),
    enabled: isContextReady && !!selectedPopupId,
  })

  const apps = (recentApps?.results ?? []) as unknown as ApplicationPublic[]
  const payments = (recentPayments?.results ?? []) as PaymentPublic[]

  return (
    <section aria-labelledby="recent-activity-title">
      <h2 id="recent-activity-title" className="text-lg font-semibold mb-3">
        Recent Activity
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {(isAppsLoading || apps.length > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Pending Applications
                </CardTitle>
                <Link
                  to="/applications/review-queue"
                  className="text-xs text-primary hover:underline whitespace-nowrap"
                >
                  Open queue
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {isAppsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                apps.map((app) => (
                  <Link
                    key={app.id}
                    to="/applications/$id"
                    params={{ id: app.id }}
                    className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {app.human?.first_name} {app.human?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.human?.email}
                      </p>
                    </div>
                    <StatusBadge
                      status={app.status}
                      className="ml-2 shrink-0"
                    />
                  </Link>
                ))
              )}
              {(recentApps?.paging?.total ?? 0) > 5 && (
                <Link
                  to="/applications/review-queue"
                  className="text-xs text-primary hover:underline flex items-center gap-1 pt-1"
                >
                  View all {recentApps?.paging?.total} pending
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {(isPaymentsLoading || payments.length > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Recent Payments
                </CardTitle>
                <Link
                  to="/payments"
                  className="text-xs text-primary hover:underline whitespace-nowrap"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {isPaymentsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                payments.map((payment) => (
                  <Link
                    key={payment.id}
                    to="/payments"
                    className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium font-mono">
                        {formatMoney(payment.amount, payment.currency || "USD")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.source || "—"}
                        {payment.created_at && (
                          <>
                            {" "}
                            •{" "}
                            {new Date(payment.created_at).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </>
                        )}
                      </p>
                    </div>
                    <StatusBadge
                      status={payment.status ?? ""}
                      className="ml-2 shrink-0"
                    />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
      {apps.length === 0 &&
        payments.length === 0 &&
        !isAppsLoading &&
        !isPaymentsLoading && (
          <Card className="mt-4">
            <CardContent className="p-4 text-sm text-muted-foreground">
              No recent activity yet.
            </CardContent>
          </Card>
        )}
    </section>
  )
}
