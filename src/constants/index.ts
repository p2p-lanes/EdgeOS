import { edgeEsmeralda } from "./Forms/edge-esmeralda";
import { edgeSa } from "./Forms/edge-sa";
import { edgeSxsw } from "./Forms/edge-sxsw";

export type DynamicForm = {
  local?: string,
  scolarship_subtitle?: string,
  fields: string[]
}

export const dynamicForm: Record<string, DynamicForm | null> = {
  "edge-esmeralda": edgeEsmeralda,
  "edge-sxsw": edgeSxsw,
  'edge-sa': edgeSa
}