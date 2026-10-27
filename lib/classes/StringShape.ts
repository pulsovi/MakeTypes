import { emitCreateContinuum } from "./CreateContinuumEmission.js";
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
    emitCreateContinuum({
      writer: emitter.proxies,
      session: emitter,
      mode: asCheckMultiArm
        ? { kind: "checkMultiArm" }
        : earlyReturnVar
          ? { kind: "createEarlyReturn", returnBinding: earlyReturnVar }
          : { kind: "bare" },
      check: "checkString",
      dataVar,
      fieldName,
      shouldThrow,
      tabLevel,
      indentFirstLine,
    });
  }
}
