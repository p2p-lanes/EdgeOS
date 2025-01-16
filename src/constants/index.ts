import { edgeEsmeralda } from "./Forms/edge-esmeralda";
import { edgeSa } from "./Forms/edge-sa";
import { edgeAustin } from "./Forms/edge-austin";

export type DynamicForm = {
  local?: string,
  scolarship_subtitle?: string,
  fields: string[]
}

export const dynamicForm: Record<string, DynamicForm | null> = {
  "edge-esmeralda": edgeEsmeralda,
  "edge-austin": edgeAustin,
  'edge-sa': edgeSa
}