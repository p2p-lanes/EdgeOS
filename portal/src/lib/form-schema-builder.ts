import { z } from "zod/v4"
import type {
  ApplicationFormSchema,
  FormFieldSchema,
} from "@/types/form-schema"

function fieldToZod(field: FormFieldSchema): z.ZodType {
  switch (field.type) {
    case "boolean":
      return z.boolean()
    case "multiselect":
      return z.array(z.string())
    case "number":
      return z.string()
    default:
      return z.string()
  }
}

export function buildFormZodSchema(
  schema: ApplicationFormSchema,
  isDraft: boolean,
): z.ZodObject {
  const shape: Record<string, z.ZodType> = {}

  // Profile fields (always part of form, not from schema)
  shape.first_name = isDraft
    ? z.string().optional()
    : z.string().min(1, "First name is required")
  shape.last_name = isDraft
    ? z.string().optional()
    : z.string().min(1, "Last name is required")
  shape.telegram = z.string().optional()
  shape.organization = z.string().optional()
  shape.role = z.string().optional()
  shape.gender = z.string().optional()
  shape.age = z.string().optional()
  shape.residence = z.string().optional()

  // Base fields from schema
  for (const [name, field] of Object.entries(schema.base_fields)) {
    // Skip first_name/last_name/email - handled as profile
    if (name === "first_name" || name === "last_name" || name === "email")
      continue

    const zodType = fieldToZod(field)
    shape[name] =
      isDraft || !field.required
        ? makeOptional(zodType)
        : makeRequired(zodType, field)
  }

  // Custom fields from schema
  for (const [name, field] of Object.entries(schema.custom_fields)) {
    const zodType = fieldToZod(field)
    shape[`custom_${name}`] =
      isDraft || !field.required
        ? makeOptional(zodType)
        : makeRequired(zodType, field)
  }

  return z.object(shape).passthrough()
}

function makeOptional(zodType: z.ZodType): z.ZodType {
  return zodType.optional()
}

function makeRequired(zodType: z.ZodType, field: FormFieldSchema): z.ZodType {
  if (zodType instanceof z.ZodString) {
    return zodType.min(1, `${field.label} is required`)
  }
  if (zodType instanceof z.ZodArray) {
    return zodType.min(1, `${field.label} is required`)
  }
  // boolean required means must be true
  return zodType
}
