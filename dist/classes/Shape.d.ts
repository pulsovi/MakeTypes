import Emitter from "./Emitter.js";
/**
 * Type of shape content
 */
export declare const enum BaseShape {
    /** The shape of the root object */
    BOTTOM = 0,
    NULL = 1,
    RECORD = 2,
    STRING = 3,
    BOOLEAN = 4,
    NUMBER = 5,
    COLLECTION = 6,
    ANY = 7,
    NEVER = 8
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
export declare abstract class Shape {
    private _samples;
    get samples(): unknown[];
    private unifySamples;
    protected readonly _optional: boolean;
    get optional(): boolean;
    constructor(args?: Partial<Shape>);
    clone(args: Partial<Shape>): Shape;
    abstract get type(): BaseShape;
    makeOptional(): Shape;
    makeNonOptional(): Shape;
    abstract emitType(e: Emitter): void;
    abstract getProxyType(e: Emitter): string;
    equal(t: Shape): t is this & {
        samples: unknown[];
    };
    abstract emitProxyTypeCheck(args: EmitProxyTypeCheckArgs): void;
    addSample(data: unknown): Shape;
}
