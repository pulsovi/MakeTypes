import type Writer from './Writer.js';

/** Session that records which `check*` helpers continuum emission referenced. */
export interface ContinuumHelperSession {
  markHelperAsUsed(name: string): void;
}

/** Leaf helpers the Create continuum can emit as three-arg `check*` calls. */
export type ContinuumLeafCheckHelper =
  | 'checkString'
  | 'checkNumber'
  | 'checkBoolean'
  | 'checkNull'
  | 'checkNever';

/** Helpers the Create continuum can emit as `check*` calls (leaf or array). */
export type ContinuumCheckHelper = ContinuumLeafCheckHelper | 'checkArray';

/**
 * Closed Create continuum continuation modes.
 * Callers pick a mode; the continuum owns early-return / multi-arm / bare / nested-record motifs.
 */
export type ContinuumMode =
  | { kind: 'createEarlyReturn'; returnBinding: string }
  | { kind: 'checkMultiArm' }
  | { kind: 'bare' }
  | { kind: 'recordNestedMultiArm'; proxyClass: string }
  | { kind: 'recordNestedAbort'; proxyClass: string; returnBinding: string }
  | { kind: 'recordNestedLocal'; proxyClass: string };

type ContinuumSink = {
  writer: Writer;
  dataVar: string;
  fieldName: string;
  shouldThrow?: boolean | string;
  tabLevel?: number;
  indentFirstLine?: boolean;
};

/** Leaf / Collection / Any scaffolding modes (not Record nested Create). */
export type ContinuumCheckMode = Extract<
  ContinuumMode,
  { kind: 'createEarlyReturn' | 'checkMultiArm' | 'bare' }
>;

/** Record nested Create continuation modes (assign Create + instanceof / abort / local). */
export type ContinuumRecordNestedMode = Extract<
  ContinuumMode,
  { kind: 'recordNestedMultiArm' | 'recordNestedAbort' | 'recordNestedLocal' }
>;

/** Narrow polymorphic `ContinuumMode` to check modes; throw if a Record-nested mode was passed. */
export function requireContinuumCheckMode(mode: ContinuumMode): ContinuumCheckMode {
  if (
    mode.kind === 'createEarlyReturn' ||
    mode.kind === 'checkMultiArm' ||
    mode.kind === 'bare'
  ) {
    return mode;
  }
  throw new Error(
    `Create continuum: expected createEarlyReturn | checkMultiArm | bare, got ${mode.kind}`,
  );
}

/** Narrow polymorphic `ContinuumMode` to Record nested modes; throw if a check mode was passed. */
export function requireRecordNestedMode(mode: ContinuumMode): ContinuumRecordNestedMode {
  if (
    mode.kind === 'recordNestedMultiArm' ||
    mode.kind === 'recordNestedAbort' ||
    mode.kind === 'recordNestedLocal'
  ) {
    return mode;
  }
  throw new Error(
    `Create continuum: expected recordNestedMultiArm | recordNestedAbort | recordNestedLocal, got ${mode.kind}`,
  );
}

export type EmitCreateContinuumArgs =
  | (ContinuumSink & {
      mode: ContinuumCheckMode;
      check: ContinuumLeafCheckHelper;
      session: ContinuumHelperSession;
    })
  | (ContinuumSink & {
      mode: ContinuumCheckMode;
      check: 'checkArray';
      /** Third `checkArray` argument expression (e.g. `"string[]"`). */
      type: string;
      session: ContinuumHelperSession;
    })
  | (ContinuumSink & {
      mode: ContinuumRecordNestedMode;
      type?: string;
    });

function isRecordNestedMode(
  args: EmitCreateContinuumArgs,
): args is ContinuumSink & {
  mode: ContinuumRecordNestedMode;
  type?: string;
} {
  return (
    args.mode.kind === 'recordNestedMultiArm' ||
    args.mode.kind === 'recordNestedAbort' ||
    args.mode.kind === 'recordNestedLocal'
  );
}

/**
 * Emit one Create continuum continuation motif onto `writer`.
 * When the motif includes a `check*` call, marks that helper used on `session`.
 */
export function emitCreateContinuum(args: EmitCreateContinuumArgs): void {
  const tabLevel = args.tabLevel ?? 0;
  const indentFirstLine = args.indentFirstLine ?? true;
  const shouldThrow = args.shouldThrow ?? true;

  if (isRecordNestedMode(args)) {
    const { writer, dataVar, fieldName, mode } = args;
    const typeArg = args.type ?? 'undefined';
    if (indentFirstLine) writer.tab(tabLevel);
    writer.writeln(
      `${dataVar} = ${mode.proxyClass}.Create(${dataVar}, ${fieldName}, ${typeArg}, ${shouldThrow});`,
    );
    if (mode.kind === 'recordNestedMultiArm') {
      writer.tab(tabLevel).writeln(`return ${dataVar} instanceof ${mode.proxyClass};`);
    } else if (mode.kind === 'recordNestedAbort') {
      writer
        .tab(tabLevel)
        .writeln(
          `if (!(${dataVar} instanceof ${mode.proxyClass})) return ${mode.returnBinding};`,
        );
    }
    return;
  }

  const { writer, session, check, dataVar, fieldName, mode } = args;
  session.markHelperAsUsed(check);
  if (indentFirstLine) writer.tab(tabLevel);
  const call =
    check === 'checkArray'
      ? `checkArray(${dataVar}, ${fieldName}, ${args.type}, ${shouldThrow})`
      : `${check}(${dataVar}, ${fieldName}, ${shouldThrow})`;
  if (mode.kind === 'checkMultiArm') {
    writer.writeln(`return ${call};`);
  } else if (mode.kind === 'createEarlyReturn') {
    writer.writeln(`if (!${call}) return ${mode.returnBinding};`);
  } else {
    writer.writeln(`${call};`);
  }
}
