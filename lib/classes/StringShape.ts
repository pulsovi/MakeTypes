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

  public emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }: EmitProxyTypeCheckArgs): void {
    emitter.markHelperAsUsed('checkString');
    emitter.proxies.tab(tabLevel).writeln(`checkString(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
  }
}
