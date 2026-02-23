const SHORTCUT_CATEGORIES = {
  NAVIGATION: "Navigation",
  ACTIONS: "Actions",
  UI: "UI",
} as const

type ShortcutCategory =
  (typeof SHORTCUT_CATEGORIES)[keyof typeof SHORTCUT_CATEGORIES]

interface Shortcut {
  id: string
  key: string
  modifiers: string[]
  label: string
  category: ShortcutCategory
}

const SHORTCUTS: Shortcut[] = [
  {
    id: "command-palette",
    key: "K",
    modifiers: ["mod"],
    label: "Command Palette",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
  },
  {
    id: "sidebar-toggle",
    key: "B",
    modifiers: ["mod"],
    label: "Toggle Sidebar",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
  },
  {
    id: "quick-create",
    key: "N",
    modifiers: ["mod", "shift"],
    label: "Quick Create",
    category: SHORTCUT_CATEGORIES.ACTIONS,
  },
  {
    id: "shortcuts-dialog",
    key: "/",
    modifiers: ["mod"],
    label: "Shortcuts Cheat Sheet",
    category: SHORTCUT_CATEGORIES.UI,
  },
  {
    id: "theme-toggle",
    key: "L",
    modifiers: ["mod", "shift"],
    label: "Cycle Theme",
    category: SHORTCUT_CATEGORIES.UI,
  },
]

const PERMISSION_LEVELS = {
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
} as const

type PermissionLevel =
  (typeof PERMISSION_LEVELS)[keyof typeof PERMISSION_LEVELS]

interface CreateRoute {
  label: string
  path: string
  permission: PermissionLevel
}

const CREATE_ROUTES: Record<string, CreateRoute> = {
  popups: {
    label: "New Popup",
    path: "/popups/new",
    permission: PERMISSION_LEVELS.ADMIN,
  },
  products: {
    label: "New Product",
    path: "/products/new",
    permission: PERMISSION_LEVELS.ADMIN,
  },
  coupons: {
    label: "New Coupon",
    path: "/coupons/new",
    permission: PERMISSION_LEVELS.ADMIN,
  },
  groups: {
    label: "New Group",
    path: "/groups/new",
    permission: PERMISSION_LEVELS.ADMIN,
  },
  "form-builder": {
    label: "New Form Field",
    path: "/form-builder/new",
    permission: PERMISSION_LEVELS.ADMIN,
  },
}

function formatShortcut(shortcut: Shortcut, isMac: boolean): string {
  const parts = shortcut.modifiers.map((mod) => {
    if (mod === "mod") return isMac ? "⌘" : "Ctrl"
    if (mod === "shift") return isMac ? "⇧" : "Shift"
    return mod
  })
  parts.push(shortcut.key)
  return parts.join(isMac ? "" : "+")
}

function getShortcutsByCategory(shortcuts: Shortcut[]) {
  const grouped = new Map<ShortcutCategory, Shortcut[]>()
  for (const shortcut of shortcuts) {
    const existing = grouped.get(shortcut.category) ?? []
    existing.push(shortcut)
    grouped.set(shortcut.category, existing)
  }
  return grouped
}

export {
  CREATE_ROUTES,
  formatShortcut,
  getShortcutsByCategory,
  PERMISSION_LEVELS,
  SHORTCUT_CATEGORIES,
  SHORTCUTS,
}
export type { CreateRoute, PermissionLevel, Shortcut, ShortcutCategory }
