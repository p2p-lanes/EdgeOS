import type {
  ApplicationCreate,
  ApplicationUpdate,
  CompanionCreate,
  UserSettableStatus,
} from "@edgeos/api-client"

const PROFILE_FIELDS = new Set([
  "first_name",
  "last_name",
  "telegram",
  "organization",
  "role",
  "gender",
  "age",
  "residence",
])

const APPLICATION_FIELDS = new Set(["referral", "info_not_shared"])

interface SplitCreateParams {
  values: Record<string, unknown>
  popupId: string
  companions: CompanionCreate[]
  status: UserSettableStatus
}

export function splitForCreate({
  values,
  popupId,
  companions,
  status,
}: SplitCreateParams): ApplicationCreate {
  const profile: Record<string, unknown> = {}
  const application: Record<string, unknown> = {}
  const customFields: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === null || value === undefined) continue

    if (key.startsWith("custom_")) {
      const fieldName = key.slice(7) // remove "custom_" prefix
      if (Array.isArray(value) && value.length === 0) continue
      customFields[fieldName] = value
    } else if (PROFILE_FIELDS.has(key)) {
      profile[key] = value
    } else if (APPLICATION_FIELDS.has(key)) {
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
}

export function splitForUpdate({
  values,
  status,
}: SplitUpdateParams): ApplicationUpdate {
  const profile: Record<string, unknown> = {}
  const application: Record<string, unknown> = {}
  const customFields: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === null || value === undefined) continue

    if (key.startsWith("custom_")) {
      const fieldName = key.slice(7)
      if (Array.isArray(value) && value.length === 0) continue
      customFields[fieldName] = value
    } else if (PROFILE_FIELDS.has(key)) {
      profile[key] = value
    } else if (APPLICATION_FIELDS.has(key)) {
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
