import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";
export declare class BooleanShape extends Shape {
    get type(): BaseShape.BOOLEAN;
    emitType(e: Emitter): void;
    getProxyType(e: Emitter): string;
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple, }: EmitProxyTypeCheckArgs): void;
}
