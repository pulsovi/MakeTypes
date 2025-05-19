import Emitter from "./Emitter.js";
import { BaseShape, Shape } from "./Shape.js";

export class BottomShape extends Shape {
  public get type(): BaseShape.BOTTOM {
    return BaseShape.BOTTOM;
  }
  public emitType(e: Emitter): void {
    throw new Error(`Doesn't make sense.`);
  }
  public getProxyType(e: Emitter): string {
    throw new Error(`Doesn't make sense.`);
  }
  public emitProxyTypeCheck(): void {
    throw new TypeError('Impossible: Bottom should never appear in a type.');
  }
}

export const bottomShape = new BottomShape();
