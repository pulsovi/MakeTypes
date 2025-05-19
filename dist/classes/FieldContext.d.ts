import Context, { ContextType } from "./Context.js";
import Emitter from "./Emitter.js";
import { RecordShape } from "./RecordShape.js";
export declare class FieldContext extends Context {
    get type(): ContextType.FIELD;
    readonly parent: RecordShape;
    readonly field: string;
    constructor(parent: RecordShape, field: string);
    getName(e: Emitter): string;
}
