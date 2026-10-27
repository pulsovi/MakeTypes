/** Narrow polymorphic `ContinuumMode` to check modes; throw if a Record-nested mode was passed. */
export function requireContinuumCheckMode(mode) {
    if (mode.kind === 'createEarlyReturn' ||
        mode.kind === 'checkMultiArm' ||
        mode.kind === 'bare') {
        return mode;
    }
    throw new Error(`Create continuum: expected createEarlyReturn | checkMultiArm | bare, got ${mode.kind}`);
}
/** Narrow polymorphic `ContinuumMode` to Record nested modes; throw if a check mode was passed. */
export function requireRecordNestedMode(mode) {
    if (mode.kind === 'recordNestedMultiArm' ||
        mode.kind === 'recordNestedAbort' ||
        mode.kind === 'recordNestedLocal') {
        return mode;
    }
    throw new Error(`Create continuum: expected recordNestedMultiArm | recordNestedAbort | recordNestedLocal, got ${mode.kind}`);
}
function isRecordNestedMode(args) {
    return (args.mode.kind === 'recordNestedMultiArm' ||
        args.mode.kind === 'recordNestedAbort' ||
        args.mode.kind === 'recordNestedLocal');
}
/**
 * Emit one Create continuum continuation motif onto `writer`.
 * When the motif includes a `check*` call, marks that helper used on `session`.
 */
export function emitCreateContinuum(args) {
    const tabLevel = args.tabLevel ?? 0;
    const indentFirstLine = args.indentFirstLine ?? true;
    const shouldThrow = args.shouldThrow ?? true;
    if (isRecordNestedMode(args)) {
        const { writer, dataVar, fieldName, mode } = args;
        const typeArg = args.type ?? 'undefined';
        if (indentFirstLine)
            writer.tab(tabLevel);
        writer.writeln(`${dataVar} = ${mode.proxyClass}.Create(${dataVar}, ${fieldName}, ${typeArg}, ${shouldThrow});`);
        if (mode.kind === 'recordNestedMultiArm') {
            writer.tab(tabLevel).writeln(`return ${dataVar} instanceof ${mode.proxyClass};`);
        }
        else if (mode.kind === 'recordNestedAbort') {
            writer
                .tab(tabLevel)
                .writeln(`if (!(${dataVar} instanceof ${mode.proxyClass})) return ${mode.returnBinding};`);
        }
        return;
    }
    const { writer, session, check, dataVar, fieldName, mode } = args;
    session.markHelperAsUsed(check);
    if (indentFirstLine)
        writer.tab(tabLevel);
    const call = check === 'checkArray'
        ? `checkArray(${dataVar}, ${fieldName}, ${args.type}, ${shouldThrow})`
        : `${check}(${dataVar}, ${fieldName}, ${shouldThrow})`;
    if (mode.kind === 'checkMultiArm') {
        writer.writeln(`return ${call};`);
    }
    else if (mode.kind === 'createEarlyReturn') {
        writer.writeln(`if (!${call}) return ${mode.returnBinding};`);
    }
    else {
        writer.writeln(`${call};`);
    }
}
