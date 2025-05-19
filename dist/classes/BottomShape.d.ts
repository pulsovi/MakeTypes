import Emitter from "./Emitter.js";
import { BaseShape, Shape } from "./Shape.js";
export declare class BottomShape extends Shape {
    get type(): BaseShape.BOTTOM;
    emitType(e: Emitter): void;
    getProxyType(e: Emitter): string;
    emitProxyTypeCheck(): void;
}
export declare const bottomShape: BottomShape;
