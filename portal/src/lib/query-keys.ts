export const queryKeys = {
  popups: {
    portal: () => ["popups", "portal"] as const,
  },
  applications: {
    mine: () => ["applications", "mine"] as const,
  },
  products: {
    byPopup: (popupId: string) => ["products", popupId] as const,
  },
  attendees: {
    directory: (popupId: string) =>
      ["attendees", "directory", popupId] as const,
  },
  payments: {
    all: ["payments"] as const,
    byApp: (applicationId: string) => ["payments", applicationId] as const,
  },
  groups: {
    mine: () => ["groups", "mine"] as const,
    detail: (groupId: string) => ["groups", "detail", groupId] as const,
    public: (slug: string) => ["groups", "public", slug] as const,
  },
  profile: {
    current: ["profile", "current"] as const,
  },
  formSchema: {
    portal: (popupId: string) => ["form-schema", "portal", popupId] as const,
  },
} as const
