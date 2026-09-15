import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";

export class StringShape extends Shape {
  public get type(): BaseShape.STRING {
    return BaseShape.STRING;
  }

  public emitType(emitter: Emitter): void {
    emitter.interfaces.write(this.getProxyType());
  }

  public getProxyType(): string {
    return "string";
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
    emitter.markHelperAsUsed('checkString');
    if (indentFirstLine) emitter.proxies.tab(tabLevel);
    if (asCheckMultiArm) {
      emitter.proxies.writeln(`return checkString(${dataVar}, ${fieldName}, ${shouldThrow});`);
    } else if (earlyReturnVar) {
      emitter.proxies.writeln(`if (!checkString(${dataVar}, ${fieldName}, ${shouldThrow})) return ${earlyReturnVar};`);
    } else {
      emitter.proxies.writeln(`checkString(${dataVar}, ${fieldName}, ${shouldThrow});`);
    }
  }
}
