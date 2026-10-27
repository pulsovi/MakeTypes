function isRecordNestedMode(args) {
    return (args.mode.kind === 'recordNestedMultiArm' || args.mode.kind === 'recordNestedAbort');
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
        else {
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
    const call = `${check}(${dataVar}, ${fieldName}, ${shouldThrow})`;
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
