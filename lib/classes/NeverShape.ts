import {
  emitCreateContinuum,
  requireContinuumCheckMode,
} from "./CreateContinuumEmission.js";
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
    mode,
  }: EmitProxyTypeCheckArgs): void {
    emitCreateContinuum({
      writer: emitter.proxies,
      session: emitter,
      mode: requireContinuumCheckMode(mode),
      check: "checkNever",
      dataVar,
      fieldName,
      shouldThrow,
      tabLevel,
      indentFirstLine,
    });
  }
}
