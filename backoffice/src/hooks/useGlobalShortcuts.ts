import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useEffect } from "react"
import { toast } from "sonner"
import type { Theme } from "@/components/theme-provider"
import { useTheme } from "@/components/theme-provider"
import useAuth from "@/hooks/useAuth"
import { CREATE_ROUTES } from "@/lib/shortcuts"

const THEME_CYCLE: Theme[] = ["light", "dark", "system"]

interface UseGlobalShortcutsOptions {
  onShortcutsDialogToggle: () => void
}

function useGlobalShortcuts({
  onShortcutsDialogToggle,
}: UseGlobalShortcutsOptions) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { isAdmin } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      // Ctrl/⌘ + Shift + N — Quick Create
      if (mod && e.shiftKey && e.key === "N") {
        e.preventDefault()
        const firstSegment = pathname.split("/").filter(Boolean)[0]
        const route = firstSegment ? CREATE_ROUTES[firstSegment] : undefined

        if (!route) {
          toast.info("No create action available for this section")
          return
        }

        if (!isAdmin) {
          toast.info("You don't have permission to create items")
          return
        }

        navigate({ to: route.path })
        return
      }

      // Ctrl/⌘ + / — Shortcuts cheat sheet
      if (mod && e.key === "/") {
        e.preventDefault()
        onShortcutsDialogToggle()
        return
      }

      // Ctrl/⌘ + Shift + L — Cycle theme
      if (mod && e.shiftKey && e.key === "L") {
        e.preventDefault()
        const currentIndex = THEME_CYCLE.indexOf(theme)
        const nextIndex = (currentIndex + 1) % THEME_CYCLE.length
        const nextTheme = THEME_CYCLE[nextIndex]
        setTheme(nextTheme)
        toast.info(`Theme: ${nextTheme}`)
        return
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [pathname, isAdmin, theme, setTheme, navigate, onShortcutsDialogToggle])
}

export default useGlobalShortcuts
