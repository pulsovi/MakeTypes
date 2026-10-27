import type Writer from './Writer.js';
/** Session that records which `check*` helpers continuum emission referenced. */
export interface ContinuumHelperSession {
    markHelperAsUsed(name: string): void;
}
/** Leaf helpers the Create continuum can emit as three-arg `check*` calls. */
export type ContinuumLeafCheckHelper = 'checkString' | 'checkNumber' | 'checkBoolean' | 'checkNull' | 'checkNever';
/** Helpers the Create continuum can emit as `check*` calls (leaf or array). */
export type ContinuumCheckHelper = ContinuumLeafCheckHelper | 'checkArray';
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
} | {
    kind: 'recordNestedLocal';
    proxyClass: string;
};
type ContinuumSink = {
    writer: Writer;
    dataVar: string;
    fieldName: string;
    shouldThrow?: boolean | string;
    tabLevel?: number;
    indentFirstLine?: boolean;
};
/** Leaf / Collection / Any scaffolding modes (not Record nested Create). */
export type ContinuumCheckMode = Extract<ContinuumMode, {
    kind: 'createEarlyReturn' | 'checkMultiArm' | 'bare';
}>;
/** Record nested Create continuation modes (assign Create + instanceof / abort / local). */
export type ContinuumRecordNestedMode = Extract<ContinuumMode, {
    kind: 'recordNestedMultiArm' | 'recordNestedAbort' | 'recordNestedLocal';
}>;
/** Narrow polymorphic `ContinuumMode` to check modes; throw if a Record-nested mode was passed. */
export declare function requireContinuumCheckMode(mode: ContinuumMode): ContinuumCheckMode;
/** Narrow polymorphic `ContinuumMode` to Record nested modes; throw if a check mode was passed. */
export declare function requireRecordNestedMode(mode: ContinuumMode): ContinuumRecordNestedMode;
export type EmitCreateContinuumArgs = (ContinuumSink & {
    mode: ContinuumCheckMode;
    check: ContinuumLeafCheckHelper;
    session: ContinuumHelperSession;
}) | (ContinuumSink & {
    mode: ContinuumCheckMode;
    check: 'checkArray';
    /** Third `checkArray` argument expression (e.g. `"string[]"`). */
    type: string;
    session: ContinuumHelperSession;
}) | (ContinuumSink & {
    mode: ContinuumRecordNestedMode;
    type?: string;
});
/**
 * Emit one Create continuum continuation motif onto `writer`.
 * When the motif includes a `check*` call, marks that helper used on `session`.
 */
export declare function emitCreateContinuum(args: EmitCreateContinuumArgs): void;
export {};
