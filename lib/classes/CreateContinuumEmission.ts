import type Writer from './Writer.js';

/** Session that records which `check*` helpers continuum emission referenced. */
export interface ContinuumHelperSession {
  markHelperAsUsed(name: string): void;
}

/** Primitive / leaf helpers the Create continuum can emit as `check*` calls. */
export type ContinuumCheckHelper =
  | 'checkString'
  | 'checkNumber'
  | 'checkBoolean'
  | 'checkNull'
  | 'checkNever';

/**
 * Closed Create continuum continuation modes.
 * Callers pick a mode; the continuum owns early-return / multi-arm / bare / nested-record motifs.
 */
export type ContinuumMode =
  | { kind: 'createEarlyReturn'; returnBinding: string }
  | { kind: 'checkMultiArm' }
  | { kind: 'bare' }
  | { kind: 'recordNestedMultiArm'; proxyClass: string }
  | { kind: 'recordNestedAbort'; proxyClass: string; returnBinding: string };

type ContinuumSink = {
  writer: Writer;
  dataVar: string;
  fieldName: string;
  shouldThrow?: boolean | string;
  tabLevel?: number;
  indentFirstLine?: boolean;
};

export type EmitCreateContinuumArgs =
  | (ContinuumSink & {
      mode: Extract<ContinuumMode, { kind: 'createEarlyReturn' | 'checkMultiArm' | 'bare' }>;
      check: ContinuumCheckHelper;
      session: ContinuumHelperSession;
    })
  | (ContinuumSink & {
      mode: Extract<ContinuumMode, { kind: 'recordNestedMultiArm' | 'recordNestedAbort' }>;
      type?: string;
    });

function isRecordNestedMode(
  args: EmitCreateContinuumArgs,
): args is ContinuumSink & {
  mode: Extract<ContinuumMode, { kind: 'recordNestedMultiArm' | 'recordNestedAbort' }>;
  type?: string;
} {
  return (
    args.mode.kind === 'recordNestedMultiArm' || args.mode.kind === 'recordNestedAbort'
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
    } else {
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
  const call = `${check}(${dataVar}, ${fieldName}, ${shouldThrow})`;
  if (mode.kind === 'checkMultiArm') {
    writer.writeln(`return ${call};`);
  } else if (mode.kind === 'createEarlyReturn') {
    writer.writeln(`if (!${call}) return ${mode.returnBinding};`);
  } else {
    writer.writeln(`${call};`);
  }
}
