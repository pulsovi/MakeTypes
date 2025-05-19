import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";
export declare class StringShape extends Shape {
    get type(): BaseShape.STRING;
    emitType(emitter: Emitter): void;
    getProxyType(): string;
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }: EmitProxyTypeCheckArgs): void;
}
