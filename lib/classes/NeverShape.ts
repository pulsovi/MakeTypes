import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";

export class NeverShape extends Shape {
  public get type(): BaseShape.NEVER {
    return BaseShape.NEVER;
  }

  public get optional(): boolean {
    return true;
  }

  public makeOptional(): NeverShape {
    return this;
  }

  public makeNonOptional(): NeverShape {
    throw new Error(`Doesn't make sense.`);
  }

  public emitType(e: Emitter): void {
    e.interfaces.write(this.getProxyType(e));
  }

  public getProxyType(e: Emitter): string {
    return "never";
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
    emitter.markHelperAsUsed('checkNever');
    if (indentFirstLine) emitter.proxies.tab(tabLevel);
    if (asCheckMultiArm) {
      emitter.proxies.writeln(`return checkNever(${dataVar}, ${fieldName}, ${shouldThrow});`);
    } else if (earlyReturnVar) {
      emitter.proxies.writeln(`if (!checkNever(${dataVar}, ${fieldName}, ${shouldThrow})) return ${earlyReturnVar};`);
    } else {
      emitter.proxies.writeln(`checkNever(${dataVar}, ${fieldName}, ${shouldThrow});`);
    }
  }
}
