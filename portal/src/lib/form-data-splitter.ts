import type {
  ApplicationCreate,
  ApplicationUpdate,
  CompanionCreate,
  UserSettableStatus,
} from "@edgeos/api-client"
import type { ApplicationFormSchema } from "@/types/form-schema"

/** Build a target map from the schema: field name → "human" | "application" */
function buildTargetMap(
  schema: ApplicationFormSchema,
): Record<string, "human" | "application"> {
  const map: Record<string, "human" | "application"> = {}
  for (const [name, field] of Object.entries(schema.base_fields)) {
    map[name] = field.target ?? "application"
  }
  return map
}

interface SplitCreateParams {
  values: Record<string, unknown>
  popupId: string
  companions: CompanionCreate[]
  status: UserSettableStatus
  schema: ApplicationFormSchema
}

export function splitForCreate({
  values,
  popupId,
  companions,
  status,
  schema,
}: SplitCreateParams): ApplicationCreate {
  const targetMap = buildTargetMap(schema)
  const profile: Record<string, unknown> = {}
  const application: Record<string, unknown> = {}
  const customFields: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === null || value === undefined) continue
    // Skip virtual fields (e.g. gender_specify)
    if (key === "gender_specify") continue

    if (key.startsWith("custom_")) {
      const fieldName = key.slice(7) // remove "custom_" prefix
      if (Array.isArray(value) && value.length === 0) continue
      customFields[fieldName] = value
    } else if (targetMap[key] === "human") {
      profile[key] = value
    } else if (targetMap[key] === "application") {
      application[key] = value
    }
  }

  return {
    popup_id: popupId,
    first_name: (profile.first_name as string) ?? "",
    last_name: (profile.last_name as string) ?? "",
    telegram: profile.telegram as string | undefined,
    organization: profile.organization as string | undefined,
    role: profile.role as string | undefined,
    gender: profile.gender as string | undefined,
    age: profile.age as string | undefined,
    residence: profile.residence as string | undefined,
    referral: application.referral as string | undefined,
    info_not_shared: application.info_not_shared as string[] | undefined,
    custom_fields:
      Object.keys(customFields).length > 0 ? customFields : undefined,
    status,
    companions: companions.length > 0 ? companions : undefined,
  }
}

interface SplitUpdateParams {
  values: Record<string, unknown>
  status: UserSettableStatus
  schema: ApplicationFormSchema
}

export function splitForUpdate({
  values,
  status,
  schema,
}: SplitUpdateParams): ApplicationUpdate {
  const targetMap = buildTargetMap(schema)
  const profile: Record<string, unknown> = {}
  const application: Record<string, unknown> = {}
  const customFields: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === null || value === undefined) continue
    if (key === "gender_specify") continue

    if (key.startsWith("custom_")) {
      const fieldName = key.slice(7)
      if (Array.isArray(value) && value.length === 0) continue
      customFields[fieldName] = value
    } else if (targetMap[key] === "human") {
      profile[key] = value
    } else if (targetMap[key] === "application") {
      application[key] = value
    }
  }

  return {
    first_name: profile.first_name as string | undefined,
    last_name: profile.last_name as string | undefined,
    telegram: profile.telegram as string | undefined,
    organization: profile.organization as string | undefined,
    role: profile.role as string | undefined,
    gender: profile.gender as string | undefined,
    age: profile.age as string | undefined,
    residence: profile.residence as string | undefined,
    referral: application.referral as string | undefined,
    info_not_shared: application.info_not_shared as string[] | undefined,
    custom_fields:
      Object.keys(customFields).length > 0 ? customFields : undefined,
    status,
  }
}
