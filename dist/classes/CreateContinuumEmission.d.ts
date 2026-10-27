import type Writer from './Writer.js';
/** Session that records which `check*` helpers continuum emission referenced. */
export interface ContinuumHelperSession {
    markHelperAsUsed(name: string): void;
}
/** Primitive / leaf helpers the Create continuum can emit as `check*` calls. */
export type ContinuumCheckHelper = 'checkString' | 'checkNumber' | 'checkBoolean' | 'checkNull' | 'checkNever';
/**
 * Closed Create continuum continuation modes.
 * Callers pick a mode; the continuum owns early-return / multi-arm / bare / nested-record motifs.
 */
export type ContinuumMode = {
    kind: 'createEarlyReturn';
    returnBinding: string;
} | {
    kind: 'checkMultiArm';
} | {
    kind: 'bare';
} | {
    kind: 'recordNestedMultiArm';
    proxyClass: string;
} | {
    kind: 'recordNestedAbort';
    proxyClass: string;
    returnBinding: string;
};
type ContinuumSink = {
    writer: Writer;
    dataVar: string;
    fieldName: string;
    shouldThrow?: boolean | string;
    tabLevel?: number;
    indentFirstLine?: boolean;
};
export type EmitCreateContinuumArgs = (ContinuumSink & {
    mode: Extract<ContinuumMode, {
        kind: 'createEarlyReturn' | 'checkMultiArm' | 'bare';
    }>;
    check: ContinuumCheckHelper;
    session: ContinuumHelperSession;
}) | (ContinuumSink & {
    mode: Extract<ContinuumMode, {
        kind: 'recordNestedMultiArm' | 'recordNestedAbort';
    }>;
    type?: string;
});
/**
 * Emit one Create continuum continuation motif onto `writer`.
 * When the motif includes a `check*` call, marks that helper used on `session`.
 */
export declare function emitCreateContinuum(args: EmitCreateContinuumArgs): void;
export {};
