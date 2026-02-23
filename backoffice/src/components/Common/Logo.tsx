import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"

import { TenantsService } from "@/client"
import { useTheme } from "@/components/theme-provider"
import { useOptionalWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

import favicon from "/assets/images/favicon.png"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const { resolvedTheme } = useTheme()
  const { isSuperadmin } = useAuth()
  const workspace = useOptionalWorkspace()
  const effectiveTenantId = workspace?.effectiveTenantId
  const isDark = resolvedTheme === "dark"

  const { data: tenant, isError: _tenantError } = useQuery({
    queryKey: ["tenants", effectiveTenantId],
    queryFn: () => TenantsService.getTenant({ tenantId: effectiveTenantId! }),
    enabled: !!effectiveTenantId && !isSuperadmin,
    staleTime: 5 * 60 * 1000,
  })

  const tenantLogo = tenant?.image_url
  const tenantIcon = tenant?.icon_url

  const shouldUseTenantLogo = !isSuperadmin && (tenantLogo || tenantIcon)

  const altText = tenant?.name || "EdgeOS"

  // Default EdgeOS logo: PNG icon + text
  const DefaultFullLogo = ({
    className: logoClassName,
  }: {
    className?: string
  }) => (
    <div className={cn("flex items-center gap-2", logoClassName)}>
      <img src={favicon} alt={altText} className="size-8 object-contain" />
      <span
        className={cn(
          "text-xl font-semibold",
          isDark ? "text-slate-50" : "text-slate-900",
        )}
      >
        EdgeOS
      </span>
    </div>
  )

  const DefaultIconLogo = ({
    className: iconClassName,
  }: {
    className?: string
  }) => (
    <img
      src={favicon}
      alt={altText}
      className={cn("size-10 object-contain", iconClassName)}
    />
  )

  const content =
    variant === "responsive" ? (
      <>
        {shouldUseTenantLogo && tenantLogo ? (
          <img
            src={tenantLogo}
            alt={altText}
            className={cn(
              "h-10 w-auto object-contain group-data-[collapsible=icon]:hidden",
              className,
            )}
          />
        ) : (
          <div className="group-data-[collapsible=icon]:hidden">
            <DefaultFullLogo className={className} />
          </div>
        )}
        {shouldUseTenantLogo && tenantIcon ? (
          <img
            src={tenantIcon}
            alt={altText}
            className={cn(
              "size-10 object-contain hidden group-data-[collapsible=icon]:block",
              className,
            )}
          />
        ) : (
          <div className="hidden group-data-[collapsible=icon]:block">
            <DefaultIconLogo className={className} />
          </div>
        )}
      </>
    ) : variant === "full" ? (
      shouldUseTenantLogo && tenantLogo ? (
        <img
          src={tenantLogo}
          alt={altText}
          className={cn("h-10 w-auto object-contain", className)}
        />
      ) : (
        <DefaultFullLogo className={className} />
      )
    ) : shouldUseTenantLogo && tenantIcon ? (
      <img
        src={tenantIcon}
        alt={altText}
        className={cn("size-10 object-contain", className)}
      />
    ) : (
      <DefaultIconLogo className={className} />
    )

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}
