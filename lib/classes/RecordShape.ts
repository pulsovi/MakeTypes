import { getReferencedRecordShapes } from "../functions/getReferencedRecordShapes.js";
import { safeField, safeInterfaceName, safeObjectField } from "../functions/sanitize.js";
import { CollectionShape } from "./CollectionShape.js";
import Context from "./Context.js";
import Emitter from "./Emitter.js";
import { FieldContext } from "./FieldContext.js";
import { NeverShape } from "./NeverShape.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";

export interface RecordShapeOptions extends Partial<RecordShape> {
  fields: Map<string, Shape>;
  contexts?: Context[];
}

export class RecordShape extends Shape {
  public get type(): BaseShape.RECORD {
    return BaseShape.RECORD;
  }
  private readonly _fields: Map<string, Shape>;
  public readonly contexts: Context[];

  private _name: string | null = null;
  private constructor(args: RecordShapeOptions) {
    super(args);
    // Assign a context to all fields.
    const fieldsWithContext = new Map<string, Shape>();
    args.fields.forEach((val, index) => {
      if (val instanceof RecordShape || val instanceof CollectionShape) {
        fieldsWithContext.set(index, val.addContext(new FieldContext(this, index)));
      } else {
        fieldsWithContext.set(index, val);
      }
    });
    this._fields = fieldsWithContext;
    this.contexts = args.contexts ?? [];
  }
  public get optional(): boolean {
    return this._optional;
  }

  /**
   * Construct a new record shape. Returns an existing, equivalent record shape
   * if applicable.
   */
  public static Create(e: Emitter, { fields, optional = false, contexts = [], samples = [] }: RecordShapeOptions): RecordShape {
    const record = new RecordShape({ fields, optional, contexts, samples });
    return e.registerRecordShape(record);
  }

  public clone(options: Partial<RecordShapeOptions>): RecordShape {
    return new RecordShape({
      contexts: this.contexts,
      fields: new Map(this._fields),
      optional: this._optional,
      samples: this.samples.slice(),
      ...options,
    });
  }
  public addContext(ctx: Context): RecordShape {
    this.contexts.push(ctx);
    return this;
  }
  public forEachField(cb: (t: Shape, name: string) => any): void {
    [...this._fields.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([name, t]) => cb(t, name));
  }
  public hasField(name: string): boolean {
    return this._fields.has(name);
  }
  public getField(name: string): Shape {
    return this._fields.get(name) ?? new NeverShape();
  }
  public equal(t: Shape): t is typeof this {
    if (super.equal(t) && this._fields.size === t._fields.size) {
      let rv = true;
      const tFields = t._fields;
      // Check all fields.
      // NOTE: Since size is equal, no need to iterate over t. Either they have the same fields
      // or t is missing fields from this one.
      this.forEachField((t, name) => {
        if (rv) {
          const field = tFields.get(name);
          if (field) {
            rv = field.equal(t);
          } else {
            rv = false;
          }
        }
      });
      return rv;
    }
    return false;
  }
  public emitType(e: Emitter): void {
    e.interfaces.write(this.getName(e));
  }
  public getProxyClass(e: Emitter): string {
    return `${this.getName(e)}${e.postfixProxy ? 'Proxy' : ''}`;
  }
  public getProxyType(e: Emitter): string {
    return `${this.getName(e)}${e.postfixProxy ? 'Proxy' : ''}`;
  }
  public emitInterfaceDefinition(e: Emitter): void {
    const w = e.interfaces;
    if (e.typeOfObject === 'type') {
      w.write(`export type ${this.getName(e)} = {`).endl();
    } else {
      w.write(`export interface ${this.getName(e)} {`).endl();
    }
    this.forEachField((t, name) => {
      w.tab(1).write(safeField(name));
      if (t.optional) w.write("?");
      w.write(": ");
      t.emitType(e);
      w.write(";").endl();
    });
    w.write(`}`);
  }
  public emitProxyClass(e: Emitter): void {
    const w = e.proxies;
    w.writeln(`export class ${this.getProxyClass(e)} {`);
    this.forEachField((t, name) => {
      if (process.argv.includes('-debug'))
        w.tab(1).writeln(`// samples: ${JSON.stringify(t.samples)}`);
      w.tab(1).writeln(`public readonly ${safeField(name)}${t.optional ? '?' : ''}: ${t.getProxyType(e)};`);
    });
    w.tab(1).writeln(`public static Parse(d: string): ${this.getProxyType(e)} {`);
    w.tab(2).writeln(`return ${this.getProxyClass(e)}.Create(JSON.parse(d));`);
    w.tab(1).writeln(`}`);
    w.tab(1).writeln(`public static Create(d: any, field?: string, multiple ?: string): ${this.getProxyType(e)} {`);
    w.tab(2).writeln(`if (!field) {`);
    w.tab(3).writeln(`obj = d;`);
    w.tab(3).writeln(`field = "root";`);
    w.tab(2).writeln(`}`);
    w.tab(2).writeln(`if (!d) {`);
    e.markHelperAsUsed('throwNull2NonNull');
    w.tab(3).writeln(`throwNull2NonNull(field, d, multiple ?? this.name);`);
    w.tab(2).writeln(`} else if (typeof(d) !== 'object') {`);
    e.markHelperAsUsed('throwNotObject');
    w.tab(3).writeln(`throwNotObject(field, d);`);
    w.tab(2).writeln(`} else if (Array.isArray(d)) {`)
    e.markHelperAsUsed('throwIsArray');
    w.tab(3).writeln(`throwIsArray(field, d);`);
    w.tab(2).writeln(`}`);
    // At this point, we know we have a non-null object.
    // Check all fields.
    this.forEachField((t, name) => {
      if (t.optional) w.tab(2).writeln(`if (${JSON.stringify(name)} in d) {`);
      t.emitProxyTypeCheck({ emitter: e, tabLevel: 2 + (t.optional ? 1 : 0), dataVar: safeObjectField('d', name), fieldName: `field + ".${name}"` });
      if (t.optional) w.tab(2).writeln(`}`);
    });

    // disallow unknown fields
    const fieldNames = [];
    this.forEachField((t, name) => { fieldNames.push(name); });
    w.tab(2).writeln(`const knownProperties = ${JSON.stringify(fieldNames)};`);
    w.tab(2).writeln(`const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));`);
    w.tab(2).writeln(`if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");`);

    // create instance
    w.tab(2).writeln(`return new ${this.getProxyClass(e)}(d);`);
    w.tab(1).writeln(`}`);
    w.tab(1).writeln(`private constructor(d: any) {`);
    // Emit an assignment for each field.
    this.forEachField((t, name) => {
      w.tab(2)
        .write(t.optional ? `if (${JSON.stringify(name)} in d) ` : '')
        .writeln(`${safeObjectField('this',name)} = ${safeObjectField('d', name)};`);
    });
    w.tab(1).writeln(`}`);
    w.writeln('}');
  }
  public getReferencedRecordShapes(e: Emitter, rv: Set<RecordShape>): void {
    this.forEachField((t, name) => {
      getReferencedRecordShapes(e, rv, t);
    });
  }
  public markAsRoot(name: string): void {
    this._name = name;
  }
  public getName(e: Emitter): string {
    if (typeof(this._name) === 'string') {
      return this._name;
    }
    // Calculate unique name.
    const nameSet = new Set<string>();
    let name = this.contexts
      .map((c) => c.getName(e))
      // Remove duplicate names.
      .filter((n) => {
        if (!nameSet.has(n)) {
          nameSet.add(n);
          return true;
        }
        return false;
      })
      .join("Or");

    // Replace invalid Typescript charachters
    name = safeInterfaceName(name);
    this._name = e.registerName(name);
    return this._name;
  }

  public emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }: EmitProxyTypeCheckArgs): void {
    emitter.proxies.tab(tabLevel)
      .writeln(`${dataVar} = ${this.getProxyClass(emitter)}.Create(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
  }
}
