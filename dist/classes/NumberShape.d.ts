import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";
export declare class NumberShape extends Shape {
    get type(): BaseShape.NUMBER;
    emitType(e: Emitter): void;
    getProxyType(e: Emitter): string;
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }: EmitProxyTypeCheckArgs): void;
}
