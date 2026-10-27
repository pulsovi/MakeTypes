import { emitCreateContinuum } from "./CreateContinuumEmission.js";
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
    emitCreateContinuum({
      writer: emitter.proxies,
      session: emitter,
      mode: asCheckMultiArm
        ? { kind: "checkMultiArm" }
        : earlyReturnVar
          ? { kind: "createEarlyReturn", returnBinding: earlyReturnVar }
          : { kind: "bare" },
      check: "checkNull",
      dataVar,
      fieldName,
      shouldThrow,
      tabLevel,
      indentFirstLine,
    });
  }
}
