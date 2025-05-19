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
    multiple,
  }: EmitProxyTypeCheckArgs): void {
    emitter.markHelperAsUsed('checkBoolean');
    emitter.proxies.tab(tabLevel).writeln(`checkBoolean(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
  }
}
