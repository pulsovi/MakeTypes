import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";

export class NullShape extends Shape {
  public get type(): BaseShape.NULL {
    return BaseShape.NULL;
  }

  public emitType(e: Emitter): void {
    e.interfaces.write("null");
  }

  public getProxyType(e: Emitter): string {
    return "null";
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
    emitter.markHelperAsUsed('checkNull');
    if (indentFirstLine) emitter.proxies.tab(tabLevel);
    if (asCheckMultiArm) {
      emitter.proxies.writeln(`return checkNull(${dataVar}, ${fieldName}, ${shouldThrow});`);
    } else if (earlyReturnVar) {
      emitter.proxies.writeln(`if (!checkNull(${dataVar}, ${fieldName}, ${shouldThrow})) return ${earlyReturnVar};`);
    } else {
      emitter.proxies.writeln(`checkNull(${dataVar}, ${fieldName}, ${shouldThrow});`);
    }
  }
}
