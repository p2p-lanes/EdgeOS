import type { FormFieldSchema } from "@/types/form-schema"
import { DynamicField } from "./fields/dynamic-field"
import SectionWrapper from "./SectionWrapper"
import { SectionSeparator } from "./section-separator"

const FULL_WIDTH_TYPES = new Set(["textarea", "multiselect"])

interface FormSectionProps {
  title: string
  subtitle?: string
  fields: [string, FormFieldSchema][]
  values: Record<string, unknown>
  errors: Record<string, string>
  onChange: (name: string, value: unknown) => void
}

export function FormSection({
  title,
  subtitle,
  fields,
  values,
  errors,
  onChange,
}: FormSectionProps) {
  if (fields.length === 0) return null

  const sorted = [...fields].sort(
    ([, a], [, b]) => (a.position ?? 0) - (b.position ?? 0),
  )

  return (
    <>
      <SectionWrapper title={title} subtitle={subtitle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.map(([name, field]) => (
            <div
              key={name}
              className={
                FULL_WIDTH_TYPES.has(field.type) ? "md:col-span-2" : ""
              }
            >
              <DynamicField
                name={name}
                field={field}
                value={values[name]}
                error={errors[name]}
                onChange={onChange}
              />
            </div>
          ))}
        </div>
      </SectionWrapper>
      <SectionSeparator />
    </>
  )
}
