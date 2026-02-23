import { AlertTriangle } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"

interface FieldError {
  name: string
  label: string
  errors: string[]
}

interface FormErrorSummaryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  fieldLabels?: Record<string, string>
}

function getFieldLabel(
  name: string,
  fieldLabels?: Record<string, string>,
): string {
  if (fieldLabels?.[name]) return fieldLabels[name]
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function FormErrorSummary({ form, fieldLabels }: FormErrorSummaryProps) {
  const summaryRef = useRef<HTMLDivElement>(null)

  const scrollToField = useCallback((fieldName: string) => {
    const el =
      document.querySelector(`[data-field-name="${fieldName}"]`) ??
      document.getElementById(fieldName) ??
      document.querySelector(`[name="${fieldName}"]`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      const input = el.querySelector("input, select, textarea") ?? el
      if (input instanceof HTMLElement) input.focus()
    }
  }, [])

  return (
    <form.Subscribe
      selector={(state: {
        fieldMeta: Record<
          string,
          { errors?: string[]; errorMap?: Record<string, string> }
        >
        submissionAttempts: number
      }) => ({
        fieldMeta: state.fieldMeta,
        submissionAttempts: state.submissionAttempts,
      })}
    >
      {({
        fieldMeta,
        submissionAttempts,
      }: {
        fieldMeta: Record<
          string,
          { errors?: string[]; errorMap?: Record<string, string> }
        >
        submissionAttempts: number
      }) => {
        const fieldErrors: FieldError[] = []
        for (const [name, meta] of Object.entries(fieldMeta)) {
          const errors = meta?.errors?.filter(Boolean) ?? []
          if (errors.length > 0) {
            fieldErrors.push({
              name,
              label: getFieldLabel(name, fieldLabels),
              errors: errors as string[],
            })
          }
        }

        if (fieldErrors.length === 0 || submissionAttempts === 0) return null

        return (
          <FormErrorSummaryContent
            ref={summaryRef}
            fieldErrors={fieldErrors}
            submissionAttempts={submissionAttempts}
            onFieldClick={scrollToField}
          />
        )
      }}
    </form.Subscribe>
  )
}

import { forwardRef } from "react"

const FormErrorSummaryContent = forwardRef<
  HTMLDivElement,
  {
    fieldErrors: FieldError[]
    submissionAttempts: number
    onFieldClick: (name: string) => void
  }
>(function FormErrorSummaryContent(
  { fieldErrors, submissionAttempts, onFieldClick },
  ref,
) {
  const prevAttemptsRef = useRef(submissionAttempts)

  useEffect(() => {
    if (
      submissionAttempts > prevAttemptsRef.current &&
      fieldErrors.length > 0
    ) {
      const el = (ref as React.RefObject<HTMLDivElement>)?.current
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    prevAttemptsRef.current = submissionAttempts
  }, [submissionAttempts, fieldErrors.length, ref])

  return (
    <div
      ref={ref}
      role="alert"
      className="rounded-lg border border-destructive/50 bg-destructive/5 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-destructive">
            Please fix {fieldErrors.length} error
            {fieldErrors.length > 1 ? "s" : ""} before submitting
          </p>
          <ul className="space-y-1">
            {fieldErrors.map(({ name, label, errors }) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => onFieldClick(name)}
                  className="text-sm text-destructive/80 hover:text-destructive hover:underline text-left"
                >
                  <span className="font-medium">{label}</span>:{" "}
                  {errors.join(", ")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
})
