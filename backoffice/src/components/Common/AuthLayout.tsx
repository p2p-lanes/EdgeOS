import { Appearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted dark:bg-zinc-900 relative hidden lg:flex lg:flex-col lg:items-center lg:justify-center gap-6">
        <Logo variant="full" className="h-16" asLink={false} />
        <p className="text-muted-foreground text-sm max-w-xs text-center">
          Manage your events, applications, and payments — all in one place.
        </p>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-end">
          <Appearance />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
    </div>
  )
}
