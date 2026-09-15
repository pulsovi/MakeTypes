import Emitter from "./Emitter.js";

/**
 * Type of shape content
 */
export const enum BaseShape {
  /** The shape of the root object */
  BOTTOM,
  NULL,
  RECORD,
  STRING,
  BOOLEAN,
  NUMBER,
  COLLECTION,
  ANY,
  NEVER,
}

export interface EmitProxyTypeCheckArgs {
  emitter: Emitter;
  tabLevel: number;
  dataVar: string;
  fieldName: string;
  shouldThrow?: boolean | string;
  indentFirstLine?: boolean;
  type?: string;
  /** When set, a failed check emits `return ${earlyReturnVar}` for the Create continuum. */
  earlyReturnVar?: string;
  /** When true, emit a checkMulti arm that returns a boolean branch success. */
  asCheckMultiArm?: boolean;
  /**
   * When true with earlyReturnVar, a nested record soft-fail aborts via
   * `if (!(dataVar instanceof Proxy)) return earlyReturnVar` (collection checkMulti arms).
   * Parent Create continua omit this so nested soft-fail stays local.
   */
  abortRecordSoftFail?: boolean;
}

export abstract class Shape {
  private _samples: unknown[] = [];
  public get samples(): unknown[] {
    this.unifySamples();
    return this._samples;
  }
  private unifySamples(): void {
    this._samples = this._samples
      .map(item => JSON.stringify(item))
      .filter((item, index, array) => array.indexOf(item) === index)
      .map(item => JSON.parse(item));
  }
  protected readonly _optional: boolean = false;
  public get optional(): boolean {
    return this._optional;
  }
  public constructor(args: Partial<Shape> = {}) {
    if (this.constructor.name !== 'NeverShape' && this.constructor.name !== 'BottomShape' && !args.samples?.length) debugger;
    this._optional = args.optional ?? false;
    this._samples = args.samples ?? [];
  }
  public clone(args: Partial<Shape>): Shape {
    return new (this.constructor as new (args: Partial<Shape>) => Shape)({
      samples: this.samples.slice(),
      optional: this.optional,
      ...args,
    });
  }
  public abstract get type(): BaseShape;
  public makeOptional(): Shape {
    return this.clone({optional: true});
  }
  public makeNonOptional(): Shape {
    return this.clone({optional: false});
  }
  public abstract emitType(e: Emitter): void;
  public abstract getProxyType(e: Emitter): string;
  public equal(t: Shape): t is this & { samples: unknown[] } {
    return (
      t instanceof this.constructor
      && t.optional === this.optional
    );
  }
  public abstract emitProxyTypeCheck(args: EmitProxyTypeCheckArgs): void;
  public addSample(data: unknown): Shape {
    this.samples.push(data);
    return this;
  }
}
