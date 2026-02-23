import { useQuery } from "@tanstack/react-query"
import {
  Building2,
  Calendar,
  CreditCard,
  FileText,
  FormInput,
  Home,
  Mail,
  Package,
  Tag,
  User,
  Users,
  UsersRound,
} from "lucide-react"
import { useMemo } from "react"

import { ApplicationReviewsService, PaymentsService } from "@/client"
import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { User as UserComponent } from "./User"
import { WorkspaceSelector } from "./WorkspaceSelector"

// Helper to get admin items with dynamic tenant link
function getAdminItems(tenantId: string | null | undefined): Item[] {
  const items: Item[] = [{ icon: Users, title: "Users", path: "/admin" }]
  if (tenantId) {
    items.push({
      icon: Building2,
      title: "Tenant",
      path: `/tenants/${tenantId}/edit`,
    })
  }
  return items
}

// Core navigation items for all users
const coreItems: Item[] = [{ icon: Home, title: "Dashboard", path: "/" }]

const popupItems: Item[] = [
  { icon: Calendar, title: "Popups", path: "/popups" },
  { icon: Package, title: "Products", path: "/products" },
  { icon: Tag, title: "Coupons", path: "/coupons" },
  { icon: UsersRound, title: "Groups", path: "/groups" },
  { icon: FormInput, title: "Form Builder", path: "/form-builder" },
  { icon: Mail, title: "Email Templates", path: "/email-templates" },
]

// Admin items (admins and superadmins)
const adminItems: Item[] = [{ icon: Users, title: "Users", path: "/admin" }]

// Superadmin only items - Tenants list view
const superadminItems: Item[] = [
  { icon: Building2, title: "Tenants", path: "/tenants" },
]

export function AppSidebar() {
  const { user: currentUser, isAdmin, isSuperadmin } = useAuth()
  const { isContextReady, selectedPopupId } = useWorkspace()

  const { data: pendingReviews } = useQuery({
    queryKey: ["pending-reviews-count", selectedPopupId],
    queryFn: () =>
      ApplicationReviewsService.listPendingReviews({
        popupId: selectedPopupId!,
        limit: 1,
      }),
    enabled: isContextReady && isAdmin,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })

  const { data: pendingPayments } = useQuery({
    queryKey: ["pending-payments-count", selectedPopupId],
    queryFn: () =>
      PaymentsService.listPayments({
        popupId: selectedPopupId!,
        paymentStatus: "pending",
        limit: 1,
      }),
    enabled: isContextReady && isAdmin,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })

  const pendingReviewCount = pendingReviews?.paging?.total ?? 0
  const pendingPaymentCount = pendingPayments?.paging?.total ?? 0

  const registrationItemsWithBadges: Item[] = useMemo(
    () => [
      {
        icon: FileText,
        title: "Applications",
        path: "/applications",
        badge: pendingReviewCount,
      },
      { icon: Users, title: "Attendees", path: "/attendees" },
      { icon: User, title: "Humans", path: "/humans" },
      {
        icon: CreditCard,
        title: "Payments",
        path: "/payments",
        badge: pendingPaymentCount,
      },
    ],
    [pendingReviewCount, pendingPaymentCount],
  )

  // For admins (non-superadmin), get their tenant-specific items
  const adminNavigationItems =
    isAdmin && !isSuperadmin
      ? getAdminItems(currentUser?.tenant_id)
      : adminItems

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        {/* Workspace context selector */}
        <WorkspaceSelector />
        <Separator className="mx-2 group-data-[collapsible=icon]:hidden" />

        {/* Core navigation */}
        <Main items={coreItems} />

        {/* Popup management section */}
        <SidebarGroup>
          <SidebarGroupLabel>Popup Management</SidebarGroupLabel>
          <Main items={popupItems} />
        </SidebarGroup>

        {/* Registration section */}
        <SidebarGroup>
          <SidebarGroupLabel>Registrations</SidebarGroupLabel>
          <Main items={registrationItemsWithBadges} />
        </SidebarGroup>

        {/* Admin section (visible to admins+) */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <Main items={adminNavigationItems} />
            {isSuperadmin && <Main items={superadminItems} />}
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <UserComponent user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
