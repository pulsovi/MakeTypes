import { concateShapes } from "../functions/concateShapes.js";
import { bottomShape } from "./BottomShape.js";
import Emitter from "./Emitter.js";
import { BaseShape, EmitProxyTypeCheckArgs, Shape } from "./Shape.js";

export class AnyShape extends Shape {
  private readonly _shapes: Shape[];
  private _hasDistilledShapes: boolean = false;
  private _distilledShapes: Shape[] = [];

  constructor({ optional, samples, shapes }: Partial<AnyShape> & { shapes?: Shape[] } = {}) {
    super({ samples, optional });
    this._shapes = shapes ?? [];
  }

  public get type(): BaseShape.ANY {
    return BaseShape.ANY;
  }

  public clone(args: Partial<AnyShape>): AnyShape {
    return new AnyShape({
      optional: this.optional,
      samples: this.samples.slice(),
      shapes: this._shapes.slice(),
      ...args,
    });
  }

  private _ensureDistilled(e: Emitter): void {
    if (!this._hasDistilledShapes) {
      let shapes = new Map<BaseShape, Shape[]>();
      for (let i = 0; i < this._shapes.length; i++) {
        const s = this._shapes[i];
        if (!shapes.has(s.type)) {
          shapes.set(s.type, []);
        }
        shapes.get(s.type)!.push(s);
      }
      shapes.forEach((shapes, key) => {
        let shape: Shape = bottomShape;
        for (let i = 0; i < shapes.length; i++) {
          shape = concateShapes(e, shape, shapes[i]);
        }
        this._distilledShapes.push(shape);
      });
      this._hasDistilledShapes = true;
    }
  }
  public getDistilledShapes(e: Emitter): Shape[] {
    this._ensureDistilled(e);
    return this._distilledShapes;
  }
  public addToShapes(shape: Shape): AnyShape {
    return new AnyShape({
      shapes: this._shapes.concat(shape instanceof AnyShape ? shape._shapes : [shape]),
      samples: this.samples.concat(shape.samples),
      optional: this.optional || shape.optional,
    });
  }
  public emitType(e: Emitter): void {
    this._ensureDistilled(e);
    this._distilledShapes.forEach((s, i) => {
      s.emitType(e);
      if (i < this._distilledShapes.length - 1) {
        e.interfaces.write(" | ");
      }
    });
  }
  public getProxyType(e: Emitter): string {
    this._ensureDistilled(e);
    return this._distilledShapes.map((s) => s.getProxyType(e)).join(" | ");
  }
  public equal(t: Shape): t is typeof this {
    return this === t;
  }
  public emitProxyTypeCheck({
    emitter,
    tabLevel,
    dataVar,
    fieldName,
  }: EmitProxyTypeCheckArgs): void {
    const writter = emitter.proxies;
    // TODO: This is terrible.
    const distilledShapes = this.getDistilledShapes(emitter);
    writter.tab(tabLevel).writeln(`// This will be refactored in the next release.`);
    distilledShapes.forEach((subShape, i) => {
      writter.tab(tabLevel + i).writeln(`try {`);
      subShape.emitProxyTypeCheck({
        emitter,
        tabLevel: tabLevel + i + 1,
        dataVar,
        fieldName,
        multiple: `"${this.getProxyType(emitter)}"`,
      });
      writter.tab(tabLevel + i).writeln(`} catch (e) {`);
      if (i === distilledShapes.length - 1) {
        writter.tab(tabLevel + i + 1).writeln(`prompt(proxyName+':', JSON.stringify(obj));`);
        if (process.argv.includes('-debug'))
          writter.tab(tabLevel + i + 1).writeln(`throw e;`);
      }
    });
    for (let i = 0; i < distilledShapes.length; i++) {
      writter.tab(tabLevel + (distilledShapes.length - i - 1)).writeln(`}`);
    }
  }
}
