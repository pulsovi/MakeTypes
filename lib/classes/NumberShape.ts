import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";

export class NumberShape extends Shape {
  public get type(): BaseShape.NUMBER {
    return BaseShape.NUMBER;
  }

  public emitType(e: Emitter): void {
    e.interfaces.write(this.getProxyType(e));
  }

  public getProxyType(e: Emitter): string {
    return "number";
  }

  public emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }: EmitProxyTypeCheckArgs): void {
    emitter.markHelperAsUsed('checkNumber');
    emitter.proxies.tab(tabLevel).writeln(`checkNumber(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
  }
}
