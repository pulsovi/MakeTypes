import Context from "./Context.js";
import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";
interface CollectionShapeOptions {
    baseShape: Shape;
    nullable?: boolean;
    optional?: boolean;
    contexts?: Context[];
    samples?: unknown[];
}
export declare class CollectionShape extends Shape {
    readonly baseShape: Shape;
    readonly contexts: Context[];
    private _name;
    constructor({ baseShape, optional, contexts, samples, }: CollectionShapeOptions);
    clone(options: Partial<CollectionShapeOptions>): CollectionShape;
    get type(): BaseShape.COLLECTION;
    addContext(ctx: Context): CollectionShape;
    emitType(e: Emitter): void;
    getProxyType(e: Emitter): string;
    equal(t: Shape): t is typeof this;
    getName(e: Emitter): string;
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple, }: EmitProxyTypeCheckArgs): void;
}
export {};
