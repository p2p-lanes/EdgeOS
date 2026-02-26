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

function getDefaultValue(field: FormFieldSchema): unknown {
  if (field.type === "boolean") return false
  if (field.type === "multiselect") return []
  return ""
}

function getInitialValues(
  schema: ApplicationFormSchema,
): Record<string, unknown> {
  const values: Record<string, unknown> = {}

  // Initialize ALL base fields from schema
  for (const [name, field] of Object.entries(schema.base_fields)) {
    values[name] = getDefaultValue(field)
  }

  // Virtual field for gender "Specify" sub-field
  values.gender_specify = ""

  // Custom fields
  for (const [name, field] of Object.entries(schema.custom_fields)) {
    values[`custom_${name}`] = getDefaultValue(field)
  }

  return values
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

  const populateFromApplication = useCallback(
    (app: ApplicationPublic) => {
      const values: Record<string, unknown> = {}

      // Populate base fields using target to know the source
      for (const [name, field] of Object.entries(schema.base_fields)) {
        if (field.target === "human" && app.human) {
          values[name] =
            (app.human as Record<string, unknown>)[name] ?? getDefaultValue(field)
        } else if (field.target === "application") {
          values[name] =
            (app as Record<string, unknown>)[name] ?? getDefaultValue(field)
        }
      }

      // Virtual field: resolve gender_specify from gender value
      const genderOptions = schema.base_fields.gender?.options ?? []
      if (values.gender && !genderOptions.includes(values.gender as string)) {
        values.gender_specify = values.gender
        values.gender = "Specify"
      }

      // Custom fields
      if (app.custom_fields) {
        for (const [name, value] of Object.entries(app.custom_fields)) {
          values[`custom_${name}`] = value
        }
      }

      dispatch({ type: "SET_VALUES", values })
    },
    [schema],
  )

  const progress = useMemo(() => {
    const allFields = { ...schema.base_fields, ...schema.custom_fields }
    const requiredFields = Object.entries(allFields).filter(
      ([, f]) => f.required,
    )
    if (requiredFields.length === 0) return 100

    const total = requiredFields.length
    let filled = 0

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
