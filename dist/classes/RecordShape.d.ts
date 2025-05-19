import Context from "./Context.js";
import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";
export interface RecordShapeOptions extends Partial<RecordShape> {
    fields: Map<string, Shape>;
    contexts?: Context[];
}
export declare class RecordShape extends Shape {
    get type(): BaseShape.RECORD;
    private readonly _fields;
    readonly contexts: Context[];
    private _name;
    private constructor();
    get optional(): boolean;
    /**
     * Construct a new record shape. Returns an existing, equivalent record shape
     * if applicable.
     */
    static Create(e: Emitter, { fields, optional, contexts, samples }: RecordShapeOptions): RecordShape;
    clone(options: Partial<RecordShapeOptions>): RecordShape;
    addContext(ctx: Context): RecordShape;
    forEachField(cb: (t: Shape, name: string) => any): void;
    hasField(name: string): boolean;
    getField(name: string): Shape;
    equal(t: Shape): t is typeof this;
    emitType(e: Emitter): void;
    getProxyClass(e: Emitter): string;
    getProxyType(e: Emitter): string;
    emitInterfaceDefinition(e: Emitter): void;
    emitProxyClass(e: Emitter): void;
    getReferencedRecordShapes(e: Emitter, rv: Set<RecordShape>): void;
    markAsRoot(name: string): void;
    getName(e: Emitter): string;
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }: EmitProxyTypeCheckArgs): void;
}
