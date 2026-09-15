import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";

export class BooleanShape extends Shape {
  public get type(): BaseShape.BOOLEAN {
    return BaseShape.BOOLEAN;
  }

  public emitType(e: Emitter): void {
    e.interfaces.write(this.getProxyType(e));
  }

  public getProxyType(e: Emitter): string {
    return "boolean";
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
    emitter.markHelperAsUsed('checkBoolean');
    if (indentFirstLine) emitter.proxies.tab(tabLevel);
    if (asCheckMultiArm) {
      emitter.proxies.writeln(`return checkBoolean(${dataVar}, ${fieldName}, ${shouldThrow});`);
    } else if (earlyReturnVar) {
      emitter.proxies.writeln(`if (!checkBoolean(${dataVar}, ${fieldName}, ${shouldThrow})) return ${earlyReturnVar};`);
    } else {
      emitter.proxies.writeln(`checkBoolean(${dataVar}, ${fieldName}, ${shouldThrow});`);
    }
  }
}
