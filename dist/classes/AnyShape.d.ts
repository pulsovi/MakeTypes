import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";
export declare class AnyShape extends Shape {
    private readonly _shapes;
    private _hasDistilledShapes;
    private _distilledShapes;
    constructor({ optional, samples, shapes }?: Partial<AnyShape> & {
        shapes?: Shape[];
    });
    get type(): BaseShape.ANY;
    clone(args: Partial<AnyShape>): AnyShape;
    private _ensureDistilled;
    getDistilledShapes(e: Emitter): Shape[];
    addToShapes(shape: Shape): AnyShape;
    emitType(e: Emitter): void;
    getProxyType(e: Emitter): string;
    equal(t: Shape): t is typeof this;
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, }: EmitProxyTypeCheckArgs): void;
}
