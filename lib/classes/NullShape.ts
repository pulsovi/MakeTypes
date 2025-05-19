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

  public emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }: EmitProxyTypeCheckArgs): void {
    emitter.markHelperAsUsed('checkNull');
    emitter.proxies.tab(tabLevel).writeln(`checkNull(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
  }
}
