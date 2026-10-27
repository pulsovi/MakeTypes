import { emitCreateContinuum } from "./CreateContinuumEmission.js";
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
    emitCreateContinuum({
      writer: emitter.proxies,
      session: emitter,
      mode: asCheckMultiArm
        ? { kind: "checkMultiArm" }
        : earlyReturnVar
          ? { kind: "createEarlyReturn", returnBinding: earlyReturnVar }
          : { kind: "bare" },
      check: "checkBoolean",
      dataVar,
      fieldName,
      shouldThrow,
      tabLevel,
      indentFirstLine,
    });
  }
}
