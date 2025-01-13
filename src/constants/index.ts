import { DynamicForm, edgeEsmeralda } from "./Forms/edge-esmeralda";
import { edgeSxsw } from "./Forms/edge-sxsw";

export const dynamicForm: Record<string, DynamicForm | null> = {
  "edge-esmeralda": edgeEsmeralda,
  "edge-sxsw": edgeSxsw,
  'edge-sa': null
}