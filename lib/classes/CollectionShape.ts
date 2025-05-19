import Context from "./Context.js";
import Emitter from "./Emitter.js";
import { EntityContext } from "./EntityContext.js";
import { RecordShape } from "./RecordShape.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";

interface CollectionShapeOptions {
  baseShape: Shape;
  nullable?: boolean;
  optional?: boolean;
  contexts?: Context[];
  samples?: unknown[];
}

export class CollectionShape extends Shape {
  public readonly baseShape: Shape;
  public readonly contexts: Context[];
  private _name: string | null = null;
  constructor({
    baseShape,
    optional = false,
    contexts = [],
    samples = [],
  }: CollectionShapeOptions) {
    super({ optional, samples});
    // Add context if a record/collection.
    this.baseShape = (baseShape instanceof RecordShape || baseShape instanceof CollectionShape)
      ? baseShape.addContext(new EntityContext(this))
      : baseShape;
    this.contexts = contexts;
  }

  public clone(options: Partial<CollectionShapeOptions>): CollectionShape {
    return new CollectionShape({
      baseShape: this.baseShape,
      optional: this._optional,
      samples: this.samples.slice(),
      contexts: this.contexts.slice(),
      ...options,
    });
  }

  public get type(): BaseShape.COLLECTION {
    return BaseShape.COLLECTION;
  }

  public addContext(ctx: Context): CollectionShape {
    this.contexts.push(ctx);
    return this;
  }
  public emitType(e: Emitter): void {
    e.interfaces.write("(");
    this.baseShape.emitType(e);
    e.interfaces.write(")[]");
  }
  public getProxyType(e: Emitter): string {
    const base = this.baseShape.getProxyType(e);
    return base.includes("|") ? `(${base})[]` : `${base}[]` ;
  }
  public equal(t: Shape): t is typeof this {
    return super.equal(t) && this.baseShape.equal(t.baseShape);
  }
  public getName(e: Emitter): string {
    if (typeof(this._name) === 'string') {
      return this._name;
    }
    const nameSet = new Set<string>();
    // No need to make collection names unique.
    this._name = this.contexts
      .map((c) => c.getName(e))
      .filter((name) => {
        if (!nameSet.has(name)) {
          nameSet.add(name);
          return true;
        }
        return false;
      })
      .join("Or");
    return this._name;
  }
  public emitProxyTypeCheck({
    emitter,
    tabLevel,
    dataVar,
    fieldName,
    multiple,
  }: EmitProxyTypeCheckArgs): void {
    const writter = emitter.proxies;

    emitter.markHelperAsUsed('checkArray');
    writter.tab(tabLevel).writeln(`checkArray(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
    writter.tab(tabLevel).writeln(`if (${dataVar}) {`)
    // Now, we check each element.
    writter.tab(tabLevel + 1).writeln(`for (let i = 0; i < ${dataVar}.length; i++) {`)
    this.baseShape.emitProxyTypeCheck({
      emitter,
      tabLevel: tabLevel + 2,
      dataVar: `${dataVar}[i]`,
      fieldName: `${fieldName} + "[" + i + "]"`
    });
    writter.tab(tabLevel + 1).writeln(`}`);
    writter.tab(tabLevel).writeln(`}`);
  }
}
