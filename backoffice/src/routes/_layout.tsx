import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useMatches,
} from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import {
  ApplicationsService,
  CouponsService,
  FormFieldsService,
  GroupsService,
  HumansService,
  PopupsService,
  ProductsService,
  TenantsService,
  UsersService,
} from "@/client";
import { CommandPalette } from "@/components/Common/CommandPalette";
import { ShortcutsDialog } from "@/components/Common/ShortcutsDialog";
import AppSidebar from "@/components/Sidebar/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useWorkspace, WorkspaceProvider } from "@/contexts/WorkspaceContext";
import useAuth, { isLoggedIn } from "@/hooks/useAuth";
import useGlobalShortcuts from "@/hooks/useGlobalShortcuts";

export const Route = createFileRoute("/_layout")({
  component: () => (
    <WorkspaceProvider>
      <Layout />
    </WorkspaceProvider>
  ),
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

const routeLabels: Record<string, string> = {
  admin: "Users",
  popups: "Popups",
  products: "Products",
  coupons: "Coupons",
  groups: "Groups",
  "form-builder": "Form Builder",
  applications: "Applications",
  attendees: "Attendees",
  humans: "Humans",
  payments: "Payments",
  tenants: "Tenants",
  settings: "Settings",
  new: "New",
  edit: "Edit",
};

const entityResolvers: Record<
  string,
  {
    queryKey: string;
    queryFn: (id: string) => Promise<{
      name?: string;
      label?: string;
      code?: string;
      full_name?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      human?: { first_name?: string; last_name?: string; email?: string };
    }>;
    getName: (data: Record<string, unknown>) => string;
  }
> = {
  applications: {
    queryKey: "applications",
    queryFn: (id) =>
      ApplicationsService.getApplication({ applicationId: id }) as never,
    getName: (d) => {
      const h = d.human as Record<string, string> | undefined;
      return h
        ? `${h.first_name ?? ""} ${h.last_name ?? ""}`.trim() ||
            h.email ||
            "Application"
        : "Application";
    },
  },
  popups: {
    queryKey: "popups",
    queryFn: (id) => PopupsService.getPopup({ popupId: id }) as never,
    getName: (d) => (d.name as string) || "Popup",
  },
  products: {
    queryKey: "products",
    queryFn: (id) => ProductsService.getProduct({ productId: id }) as never,
    getName: (d) => (d.name as string) || "Product",
  },
  coupons: {
    queryKey: "coupons",
    queryFn: (id) => CouponsService.getCoupon({ couponId: id }) as never,
    getName: (d) => (d.code as string) || "Coupon",
  },
  groups: {
    queryKey: "groups",
    queryFn: (id) => GroupsService.getGroup({ groupId: id }) as never,
    getName: (d) => (d.name as string) || "Group",
  },
  "form-builder": {
    queryKey: "form-fields",
    queryFn: (id) => FormFieldsService.getFormField({ fieldId: id }) as never,
    getName: (d) => (d.label as string) || "Field",
  },
  humans: {
    queryKey: "humans",
    queryFn: (id) => HumansService.getHuman({ humanId: id }) as never,
    getName: (d) =>
      `${(d.first_name as string) ?? ""} ${(d.last_name as string) ?? ""}`.trim() ||
      (d.email as string) ||
      "Human",
  },
  tenants: {
    queryKey: "tenants",
    queryFn: (id) => TenantsService.getTenant({ tenantId: id }) as never,
    getName: (d) => (d.name as string) || "Tenant",
  },
  admin: {
    queryKey: "users",
    queryFn: (id) => UsersService.getUser({ userId: id }) as never,
    getName: (d) => (d.full_name as string) || (d.email as string) || "User",
  },
};

function EntityBreadcrumbLabel({
  parentSegment,
  uuid,
}: {
  parentSegment: string;
  uuid: string;
}) {
  const resolver = entityResolvers[parentSegment];

  const { data } = useQuery({
    queryKey: [resolver?.queryKey ?? parentSegment, uuid],
    queryFn: () => resolver?.queryFn(uuid),
    enabled: !!resolver,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!resolver) return <>Details</>;
  if (!data) return <>...</>;
  return <>{resolver.getName(data as unknown as Record<string, unknown>)}</>;
}

function Breadcrumbs() {
  const matches = useMatches();

  const breadcrumbs = matches
    .filter((match) => match.pathname !== "/_layout")
    .reduce<
      { path: string; label?: string; entityContent?: React.ReactNode }[]
    >((acc, match) => {
      const pathname = match.pathname;
      const segments = pathname.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1];

      if (!lastSegment || pathname === "/") return acc;
      if (acc.some((c) => c.path === pathname)) return acc;

      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          lastSegment,
        );

      let label: string | undefined = routeLabels[lastSegment];
      let entityContent: React.ReactNode | undefined;
      if (isUuid) {
        const parentSegment = segments[segments.length - 2];
        entityContent = (
          <EntityBreadcrumbLabel
            parentSegment={parentSegment}
            uuid={lastSegment}
          />
        );
      }
      if (!label && !isUuid) {
        label = lastSegment;
      }

      acc.push({
        path: pathname,
        label: label
          ? label.charAt(0).toUpperCase() + label.slice(1)
          : undefined,
        entityContent,
      });
      return acc;
    }, []);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        to="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <Fragment key={crumb.path}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">
              {crumb.entityContent ?? crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.entityContent ?? crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

function WorkspaceIndicator() {
  const { selectedPopupId, selectedTenantId } = useWorkspace();
  const { isSuperadmin } = useAuth();

  const { data: tenants } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => TenantsService.listTenants({ skip: 0, limit: 100 }),
    enabled: isSuperadmin && !!selectedTenantId,
  });

  const { data: popups } = useQuery({
    queryKey: ["popups", { page: 0, pageSize: 100 }],
    queryFn: () => PopupsService.listPopups({ skip: 0, limit: 100 }),
    enabled: !!selectedPopupId,
  });

  const tenantName = tenants?.results?.find(
    (t) => t.id === selectedTenantId,
  )?.name;
  const popupName = popups?.results?.find(
    (p) => p.id === selectedPopupId,
  )?.name;

  if (!popupName && !tenantName) return null;

  return (
    <div className="flex items-center gap-1.5">
      {isSuperadmin && tenantName && (
        <Badge variant="outline" className="max-w-[140px] truncate text-xs">
          {tenantName}
        </Badge>
      )}
      {popupName && (
        <Badge variant="secondary" className="max-w-[160px] truncate text-xs">
          {popupName}
        </Badge>
      )}
    </div>
  );
}

function ShortcutsHint() {
  const [modifier, setModifier] = useState("Ctrl");

  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad/.test(navigator.userAgent)
    ) {
      setModifier("⌘");
    }
  }, []);

  return (
    <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
      <div className="flex items-center gap-1">
        <span>Search</span>
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">{modifier}</span>K
        </kbd>
      </div>
      <div className="flex items-center gap-1">
        <span>More</span>
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">{modifier}</span>/
        </kbd>
      </div>
    </div>
  );
}

function Layout() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const toggleShortcutsDialog = () => {
    setShortcutsOpen((prev) => !prev);
  };

  useGlobalShortcuts({ onShortcutsDialogToggle: toggleShortcutsDialog });

  return (
    <SidebarProvider>
      <AppSidebar />
      <CommandPalette />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumbs />
          <div className="ml-auto flex items-center gap-4">
            <ShortcutsHint />
            <WorkspaceIndicator />
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
