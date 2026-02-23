import { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  formatShortcut,
  getShortcutsByCategory,
  SHORTCUTS,
} from "@/lib/shortcuts"

interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad/.test(navigator.userAgent)
    ) {
      setIsMac(true)
    }
  }, [])

  const grouped = getShortcutsByCategory(SHORTCUTS)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Available shortcuts for quick navigation and actions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {[...grouped.entries()].map(([category, shortcuts]) => (
            <div key={category}>
              <h4 className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
                {category}
              </h4>
              <div className="space-y-1">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5"
                  >
                    <span className="text-sm">{shortcut.label}</span>
                    <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium">
                      {formatShortcut(shortcut, isMac)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
