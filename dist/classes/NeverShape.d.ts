import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";
export declare class NeverShape extends Shape {
    get type(): BaseShape.NEVER;
    get optional(): boolean;
    makeOptional(): NeverShape;
    makeNonOptional(): NeverShape;
    emitType(e: Emitter): void;
    getProxyType(e: Emitter): string;
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }: EmitProxyTypeCheckArgs): void;
}
