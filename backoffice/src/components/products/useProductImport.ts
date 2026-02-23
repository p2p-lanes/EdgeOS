import type { ProductBatchItem, ProductBatchResult } from "@/client"
import type { CsvColumnConfig } from "@/components/Common/CsvImportDialog"

const VALID_CATEGORIES = ["ticket", "housing", "merch", "other", "patreon"]
const VALID_ATTENDEE_CATEGORIES = ["main", "spouse", "kid"]
const VALID_DURATION_TYPES = ["day", "week", "month", "full"]

export const productCsvColumns: CsvColumnConfig<ProductBatchItem>[] = [
  {
    header: "Name",
    key: "name",
    required: true,
  },
  {
    header: "Price",
    key: "price",
    required: true,
    validate: (v) => {
      const n = Number(v)
      if (Number.isNaN(n)) return "Must be a number"
      if (n < 0) return "Must be >= 0"
      return null
    },
    parse: (v) => (v ? Number(v) : 0),
  },
  {
    header: "Category",
    key: "category",
    validate: (v) => {
      if (!v) return null
      const lower = v.toLowerCase()
      return VALID_CATEGORIES.includes(lower)
        ? null
        : `Must be one of: ${VALID_CATEGORIES.join(", ")}`
    },
    parse: (v) => (v ? v.toLowerCase() : undefined),
  },
  {
    header: "Description",
    key: "description",
    parse: (v) => v || undefined,
  },
  {
    header: "Attendee Category",
    key: "attendee_category",
    validate: (v) => {
      if (!v) return null
      const lower = v.toLowerCase()
      return VALID_ATTENDEE_CATEGORIES.includes(lower)
        ? null
        : `Must be one of: ${VALID_ATTENDEE_CATEGORIES.join(", ")}`
    },
    parse: (v) => (v ? v.toLowerCase() : undefined),
  },
  {
    header: "Duration Type",
    key: "duration_type",
    validate: (v) => {
      if (!v) return null
      const lower = v.toLowerCase()
      return VALID_DURATION_TYPES.includes(lower)
        ? null
        : `Must be one of: ${VALID_DURATION_TYPES.join(", ")}`
    },
    parse: (v) => (v ? v.toLowerCase() : undefined),
  },
  {
    header: "Start Date",
    key: "start_date",
    validate: (v) => {
      if (!v) return null
      const d = new Date(v)
      return Number.isNaN(d.getTime())
        ? "Must be a valid date (YYYY-MM-DD)"
        : null
    },
    parse: (v) => (v ? new Date(v).toISOString() : undefined),
  },
  {
    header: "End Date",
    key: "end_date",
    validate: (v) => {
      if (!v) return null
      const d = new Date(v)
      return Number.isNaN(d.getTime())
        ? "Must be a valid date (YYYY-MM-DD)"
        : null
    },
    parse: (v) => (v ? new Date(v).toISOString() : undefined),
  },
  {
    header: "Exclusive",
    key: "exclusive",
    validate: (v) => {
      if (!v) return null
      const lower = v.toLowerCase()
      return ["true", "false", "1", "0", "yes", "no"].includes(lower)
        ? null
        : "Must be true/false, yes/no, or 1/0"
    },
    parse: (v) => {
      if (!v) return false
      return ["true", "1", "yes"].includes(v.toLowerCase())
    },
  },
  {
    header: "Is Active",
    key: "is_active",
    validate: (v) => {
      if (!v) return null
      const lower = v.toLowerCase()
      return ["true", "false", "1", "0", "yes", "no"].includes(lower)
        ? null
        : "Must be true/false, yes/no, or 1/0"
    },
    parse: (v) => {
      if (!v) return true
      return ["true", "1", "yes"].includes(v.toLowerCase())
    },
  },
  {
    header: "Max Quantity",
    key: "max_quantity",
    validate: (v) => {
      if (!v) return null
      const n = Number(v)
      if (!Number.isInteger(n)) return "Must be a whole number"
      if (n < 0) return "Must be >= 0"
      return null
    },
    parse: (v) => (v ? Number(v) : undefined),
  },
] satisfies CsvColumnConfig<ProductBatchItem>[]

export type { ProductBatchResult }
