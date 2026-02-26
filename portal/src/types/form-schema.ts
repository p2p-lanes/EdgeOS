export interface FormFieldSchema {
  type:
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "select"
    | "multiselect"
    | "date"
    | "email"
    | "url"
  label: string
  required: boolean
  section: string
  position?: number
  options?: string[]
  placeholder?: string
  help_text?: string
  target?: "human" | "application"
}

export interface ApplicationFormSchema {
  base_fields: Record<string, FormFieldSchema>
  custom_fields: Record<string, FormFieldSchema>
  sections: string[]
}
