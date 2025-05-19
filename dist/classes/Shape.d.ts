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
    multiple?: string;
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
