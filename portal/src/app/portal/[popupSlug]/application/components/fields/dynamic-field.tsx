import CheckboxForm from "@/components/ui/Form/Checkbox"
import InputForm from "@/components/ui/Form/Input"
import SelectForm from "@/components/ui/Form/Select"
import TextAreaForm from "@/components/ui/Form/TextArea"
import { FormInputWrapper } from "@/components/ui/form-input-wrapper"
import { LabelRequired } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/MultiSelect"
import type { FormFieldSchema } from "@/types/form-schema"

interface DynamicFieldProps {
  name: string
  field: FormFieldSchema
  value: unknown
  error?: string
  onChange: (name: string, value: unknown) => void
}

function mapOptions(options?: string[]) {
  return (options ?? []).map((opt) => ({ value: opt, label: opt }))
}

export function DynamicField({
  name,
  field,
  value,
  error,
  onChange,
}: DynamicFieldProps) {
  switch (field.type) {
    case "text":
    case "email":
    case "url":
      return (
        <InputForm
          label={field.label}
          id={name}
          type={
            field.type === "url"
              ? "url"
              : field.type === "email"
                ? "email"
                : "text"
          }
          value={(value as string) ?? ""}
          onChange={(v) => onChange(name, v)}
          error={error}
          isRequired={field.required}
          subtitle={field.help_text}
          placeholder={field.placeholder}
        />
      )

    case "textarea":
      return (
        <TextAreaForm
          label={field.label}
          id={name}
          value={(value as string) ?? ""}
          handleChange={(v) => onChange(name, v)}
          error={error ?? ""}
          isRequired={field.required}
          subtitle={field.help_text}
          placeholder={field.placeholder}
        />
      )

    case "number":
      return (
        <InputForm
          label={field.label}
          id={name}
          type="number"
          value={(value as string) ?? ""}
          onChange={(v) => onChange(name, v)}
          error={error}
          isRequired={field.required}
          subtitle={field.help_text}
          placeholder={field.placeholder}
        />
      )

    case "date":
      return (
        <InputForm
          label={field.label}
          id={name}
          type="date"
          value={(value as string) ?? ""}
          onChange={(v) => onChange(name, v)}
          error={error}
          isRequired={field.required}
          subtitle={field.help_text}
        />
      )

    case "boolean":
      return (
        <CheckboxForm
          title={field.label}
          label={field.help_text}
          id={name}
          checked={(value as boolean) ?? false}
          onCheckedChange={(v) => onChange(name, v)}
          required={field.required}
          error={error}
        />
      )

    case "select":
      return (
        <SelectForm
          label={field.label}
          id={name}
          value={(value as string) ?? ""}
          onChange={(v) => onChange(name, v)}
          options={mapOptions(field.options)}
          error={error}
          isRequired={field.required}
          placeholder={field.placeholder ?? "Select an option"}
        />
      )

    case "multiselect":
      return (
        <FormInputWrapper>
          <LabelRequired isRequired={field.required}>
            {field.label}
          </LabelRequired>
          {field.help_text && (
            <p className="text-sm text-muted-foreground">{field.help_text}</p>
          )}
          <MultiSelect
            options={mapOptions(field.options)}
            onChange={(v) => onChange(name, v)}
            defaultValue={(value as string[]) ?? []}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </FormInputWrapper>
      )

    default:
      return (
        <InputForm
          label={field.label}
          id={name}
          value={(value as string) ?? ""}
          onChange={(v) => onChange(name, v)}
          error={error}
          isRequired={field.required}
          subtitle={field.help_text}
          placeholder={field.placeholder}
        />
      )
  }
}
