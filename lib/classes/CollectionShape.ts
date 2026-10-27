import Context from "./Context.js";
import {
  emitCreateContinuum,
  type ContinuumCheckMode,
  type ContinuumMode,
} from "./CreateContinuumEmission.js";
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

function continuumModeForCollectionChild(
  parentMode: ContinuumCheckMode,
  baseShape: Shape,
  emitter: Emitter,
): ContinuumMode {
  if (baseShape instanceof RecordShape) {
    const proxyClass = baseShape.getProxyClass(emitter);
    if (parentMode.kind === "checkMultiArm") {
      return {
        kind: "recordNestedAbort",
        proxyClass,
        returnBinding: "false",
      };
    }
    return { kind: "recordNestedLocal", proxyClass };
  }
  if (parentMode.kind === "checkMultiArm") {
    return { kind: "createEarlyReturn", returnBinding: "false" };
  }
  return parentMode;
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
    shouldThrow = true,
    indentFirstLine = true,
    mode,
  }: EmitProxyTypeCheckArgs): void {
    const writter = emitter.proxies;
    const typeArg = `"${this.baseShape.getProxyType(emitter)}[]"`;
    const checkMode = mode as ContinuumCheckMode;

    // checkArray gate: Create / multi-arm use continuum early-return; bare keeps `if (checkArray) { … }` framing.
    if (checkMode.kind === "checkMultiArm") {
      emitCreateContinuum({
        writer: writter,
        session: emitter,
        mode: { kind: "createEarlyReturn", returnBinding: "false" },
        check: "checkArray",
        type: typeArg,
        dataVar,
        fieldName,
        shouldThrow,
        tabLevel,
        indentFirstLine,
      });
    } else if (checkMode.kind === "createEarlyReturn") {
      emitCreateContinuum({
        writer: writter,
        session: emitter,
        mode: checkMode,
        check: "checkArray",
        type: typeArg,
        dataVar,
        fieldName,
        shouldThrow,
        tabLevel,
        indentFirstLine,
      });
    } else {
      emitter.markHelperAsUsed("checkArray");
      if (indentFirstLine) writter.tab(tabLevel);
      writter.writeln(
        `if (checkArray(${dataVar}, ${fieldName}, ${typeArg}, ${shouldThrow})) {`,
      );
    }

    // Element loop framing stays here; child checks receive the continuum mode for their path.
    const loopTab = checkMode.kind === "bare" ? tabLevel + 1 : tabLevel;
    writter.tab(loopTab).writeln(`for (let i = 0; i < ${dataVar}.length; i++) {`);
    this.baseShape.emitProxyTypeCheck({
      emitter,
      tabLevel: loopTab + 1,
      dataVar: `${dataVar}[i]`,
      fieldName: `${fieldName} + "[" + i + "]"`,
      shouldThrow,
      mode: continuumModeForCollectionChild(checkMode, this.baseShape, emitter),
    });
    writter.tab(loopTab).writeln(`}`);
    if (checkMode.kind === "checkMultiArm") {
      writter.tab(tabLevel).writeln(`return true;`);
    } else if (checkMode.kind === "bare") {
      writter.tab(tabLevel).writeln(`}`);
    }
  }
}
