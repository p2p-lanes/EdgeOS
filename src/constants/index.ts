import { edgeEsmeralda } from "./Forms/edge-esmeralda";
import { edgeSa } from "./Forms/edge-sa";
import { edgeAustin } from "./Forms/edge-austin";
import { edgeBhutan2025 } from "./Forms/edge-bhutan";

export type DynamicForm = {
  local?: string,
  personal_information?:{
    title?: string,
    subtitle?: string,
    residence_placeholder?: string,
  },
  professional_details?:{
    title?: string,
    subtitle?: string,
  },
  participation?:{
    title?: string,
    subtitle?: string,
    duration_label?: string,
    duration_subtitle?: string,
  },
  scholarship?: {
    title?: string,
    subtitle?: string,
    interest_text?: string,
    scholarship_request?: string,
    scholarship_details?: string,
  },
  accommodation?: {
    title?: string,
    subtitle?: string,
  },
  fields: string[]
}

export const dynamicForm: Record<string, DynamicForm | null> = {
  'default': edgeEsmeralda,
  'buenos-aires': edgeEsmeralda,
  "edge-esmeralda": edgeEsmeralda,
  "edge-austin": edgeAustin,
  'edge-sa': edgeSa,
  'edge-bhutan-2025': edgeBhutan2025
}