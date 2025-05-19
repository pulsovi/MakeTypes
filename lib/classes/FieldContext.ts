import { pascalCase } from "../functions/pascalCase.js";
import Context, { ContextType } from "./Context.js";
import Emitter from "./Emitter.js";
import { RecordShape } from "./RecordShape.js";

export class FieldContext extends Context {
  public get type(): ContextType.FIELD {
    return ContextType.FIELD;
  }
  public readonly parent: RecordShape;
  public readonly field: string;
  constructor(parent: RecordShape, field: string) {
    super();
    this.parent = parent;
    this.field = field;
  }
  public getName(e: Emitter): string {
    const name = pascalCase(this.field);
    return name;
  }
}
