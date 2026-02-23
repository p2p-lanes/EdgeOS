import { useNavigate } from "@tanstack/react-router"
import {
  Calendar,
  CreditCard,
  FileText,
  FormInput,
  Home,
  Package,
  Plus,
  Tag,
  User,
  Users,
  UsersRound,
} from "lucide-react"
import { useEffect, useState } from "react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import useAuth from "@/hooks/useAuth"
import { CREATE_ROUTES, formatShortcut, SHORTCUTS } from "@/lib/shortcuts"

const pages = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "Popups", to: "/popups", icon: Calendar },
  { label: "Products", to: "/products", icon: Package },
  { label: "Coupons", to: "/coupons", icon: Tag },
  { label: "Groups", to: "/groups", icon: UsersRound },
  { label: "Form Builder", to: "/form-builder", icon: FormInput },
  { label: "Applications", to: "/applications", icon: FileText },
  { label: "Attendees", to: "/attendees", icon: Users },
  { label: "Humans", to: "/humans", icon: User },
  { label: "Payments", to: "/payments", icon: CreditCard },
]

const adminPages = [{ label: "Users", to: "/admin", icon: Users }]

const superadminPages = [{ label: "Tenants", to: "/tenants", icon: Users }]

const createActions = Object.values(CREATE_ROUTES).map((route) => ({
  label: route.label,
  to: route.path,
  icon: Plus,
}))

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { isAdmin, isSuperadmin } = useAuth()
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.userAgent)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (to: string) => {
    setOpen(false)
    navigate({ to })
  }

  const allPages = [
    ...pages,
    ...(isAdmin ? adminPages : []),
    ...(isSuperadmin ? superadminPages : []),
  ]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {allPages.map((page) => (
            <CommandItem key={page.to} onSelect={() => runCommand(page.to)}>
              <page.icon className="mr-2 h-4 w-4" />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {isAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Create">
              {createActions.map((action) => (
                <CommandItem
                  key={action.to}
                  onSelect={() => runCommand(action.to)}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        <CommandSeparator />
        <CommandGroup heading="Shortcuts">
          {SHORTCUTS.map((shortcut) => (
            <CommandItem key={shortcut.id} disabled>
              {shortcut.label}
              <CommandShortcut>
                {formatShortcut(shortcut, isMac)}
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
