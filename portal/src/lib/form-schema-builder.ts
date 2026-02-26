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

  // Base fields from schema (all profile + application fields)
  for (const [name, field] of Object.entries(schema.base_fields)) {
    const zodType = fieldToZod(field)
    shape[name] =
      isDraft || !field.required
        ? makeOptional(zodType)
        : makeRequired(zodType, field)
  }

  // gender_specify is a virtual field for the "Specify" sub-field
  shape.gender_specify = z.string().optional()

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
