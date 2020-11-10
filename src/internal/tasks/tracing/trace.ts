import { TraceType } from "./trace-type";
import { TraceResult } from "./trace-result";

export interface Trace {
  timestamp: Date;
  id: string;
  type: TraceType;
  name: string;
  result: TraceResult;
  content: { [key: string]: any };
}
