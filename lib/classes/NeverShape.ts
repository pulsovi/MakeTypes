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

  public emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }: EmitProxyTypeCheckArgs): void {
    emitter.markHelperAsUsed('checkNever');
    emitter.proxies.tab(tabLevel).writeln(`checkNever(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
  }
}
