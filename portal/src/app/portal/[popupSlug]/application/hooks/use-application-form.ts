import type { ApplicationPublic } from "@edgeos/api-client"
import { useCallback, useMemo, useReducer } from "react"
import { buildFormZodSchema } from "@/lib/form-schema-builder"
import type {
  ApplicationFormSchema,
  FormFieldSchema,
} from "@/types/form-schema"

interface FormState {
  values: Record<string, unknown>
  errors: Record<string, string>
  touched: Set<string>
}

type FormAction =
  | { type: "SET_FIELD"; name: string; value: unknown }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "SET_VALUES"; values: Record<string, unknown> }
  | { type: "RESET" }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        values: { ...state.values, [action.name]: action.value },
        touched: new Set(state.touched).add(action.name),
        // Clear error for this field on change
        errors: { ...state.errors, [action.name]: "" },
      }
    case "SET_ERRORS":
      return { ...state, errors: action.errors }
    case "SET_VALUES":
      return { ...state, values: { ...state.values, ...action.values } }
    case "RESET":
      return { values: {}, errors: {}, touched: new Set() }
    default:
      return state
  }
}

function getInitialValues(
  schema: ApplicationFormSchema,
): Record<string, unknown> {
  const values: Record<string, unknown> = {
    first_name: "",
    last_name: "",
    telegram: "",
    organization: "",
    role: "",
    gender: "",
    age: "",
    residence: "",
  }

  for (const [name, field] of Object.entries(schema.base_fields)) {
    if (name === "first_name" || name === "last_name" || name === "email")
      continue
    values[name] = getDefaultValue(field)
  }

  for (const [name, field] of Object.entries(schema.custom_fields)) {
    values[`custom_${name}`] = getDefaultValue(field)
  }

  return values
}

function getDefaultValue(field: FormFieldSchema): unknown {
  if (field.type === "boolean") return false
  if (field.type === "multiselect") return []
  return ""
}

export function useApplicationForm(schema: ApplicationFormSchema) {
  const initialValues = useMemo(() => getInitialValues(schema), [schema])

  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {},
    touched: new Set<string>(),
  })

  const handleChange = useCallback((name: string, value: unknown) => {
    dispatch({ type: "SET_FIELD", name, value })
  }, [])

  const validate = useCallback(
    (
      isDraft: boolean,
    ): { isValid: boolean; errors: Record<string, string> } => {
      const zodSchema = buildFormZodSchema(schema, isDraft)
      const result = zodSchema.safeParse(state.values)

      if (result.success) {
        dispatch({ type: "SET_ERRORS", errors: {} })
        return { isValid: true, errors: {} }
      }

      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join(".")
        if (!errors[path]) {
          errors[path] = issue.message
        }
      }

      dispatch({ type: "SET_ERRORS", errors })
      return { isValid: false, errors }
    },
    [schema, state.values],
  )

  const populateFromApplication = useCallback((app: ApplicationPublic) => {
    const values: Record<string, unknown> = {}

    // Profile fields from human
    if (app.human) {
      values.first_name = app.human.first_name ?? ""
      values.last_name = app.human.last_name ?? ""
      values.telegram = app.human.telegram ?? ""
      values.organization = app.human.organization ?? ""
      values.role = app.human.role ?? ""
      values.gender = app.human.gender ?? ""
      values.age = app.human.age ?? ""
      values.residence = app.human.residence ?? ""
    }

    // Application-level fields
    values.referral = app.referral ?? ""
    if (app.info_not_shared) {
      values.info_not_shared = app.info_not_shared
    }

    // Custom fields
    if (app.custom_fields) {
      for (const [name, value] of Object.entries(app.custom_fields)) {
        values[`custom_${name}`] = value
      }
    }

    dispatch({ type: "SET_VALUES", values })
  }, [])

  const progress = useMemo(() => {
    const allFields = { ...schema.base_fields, ...schema.custom_fields }
    const requiredFields = Object.entries(allFields).filter(
      ([, f]) => f.required,
    )
    if (requiredFields.length === 0) return 100

    // Also count profile required fields (first_name, last_name)
    const profileRequired = ["first_name", "last_name"]
    const total = requiredFields.length + profileRequired.length
    let filled = 0

    for (const key of profileRequired) {
      const val = state.values[key]
      if (val && String(val).trim()) filled++
    }

    for (const [name, field] of requiredFields) {
      // Check both base and custom field naming
      const key = schema.custom_fields[name] ? `custom_${name}` : name
      const val = state.values[key]

      if (field.type === "boolean") {
        if (val === true) filled++
      } else if (field.type === "multiselect") {
        if (Array.isArray(val) && val.length > 0) filled++
      } else if (val && String(val).trim()) {
        filled++
      }
    }

    return Math.round((filled / total) * 100)
  }, [schema, state.values])

  return {
    values: state.values,
    errors: state.errors,
    handleChange,
    validate,
    populateFromApplication,
    setValues: (values: Record<string, unknown>) =>
      dispatch({ type: "SET_VALUES", values }),
    progress,
  }
}
