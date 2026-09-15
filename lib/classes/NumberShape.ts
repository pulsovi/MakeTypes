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

  public emitProxyTypeCheck({
    emitter,
    tabLevel,
    dataVar,
    fieldName,
    shouldThrow = true,
    indentFirstLine = true,
    earlyReturnVar,
    asCheckMultiArm = false,
  }: EmitProxyTypeCheckArgs): void {
    emitter.markHelperAsUsed('checkNumber');
    if (indentFirstLine) emitter.proxies.tab(tabLevel);
    if (asCheckMultiArm) {
      emitter.proxies.writeln(`return checkNumber(${dataVar}, ${fieldName}, ${shouldThrow});`);
    } else if (earlyReturnVar) {
      emitter.proxies.writeln(`if (!checkNumber(${dataVar}, ${fieldName}, ${shouldThrow})) return ${earlyReturnVar};`);
    } else {
      emitter.proxies.writeln(`checkNumber(${dataVar}, ${fieldName}, ${shouldThrow});`);
    }
  }
}
