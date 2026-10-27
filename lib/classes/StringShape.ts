import {
  emitCreateContinuum,
  type ContinuumCheckMode,
} from "./CreateContinuumEmission.js";
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
    mode,
  }: EmitProxyTypeCheckArgs): void {
    emitCreateContinuum({
      writer: emitter.proxies,
      session: emitter,
      mode: mode as ContinuumCheckMode,
      check: "checkString",
      dataVar,
      fieldName,
      shouldThrow,
      tabLevel,
      indentFirstLine,
    });
  }
}
