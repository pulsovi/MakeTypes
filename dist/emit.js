export function emitProxyTypeCheck(e, w, t, tabLevel, dataVar, fieldName) {
    switch (t.type) {
        case 7 /* BaseShape.ANY */:
            // TODO: This is terrible.
            const distilledShapes = t.getDistilledShapes(e);
            w.tab(tabLevel).writeln(`// This will be refactored in the next release.`);
            distilledShapes.forEach((s, i) => {
                w.tab(tabLevel + i).writeln(`try {`);
                emitProxyTypeCheck(e, w, s, tabLevel + i + 1, dataVar, fieldName);
                w.tab(tabLevel + i).writeln(`} catch (e) {`);
                if (i === distilledShapes.length - 1) {
                    w.tab(tabLevel + i + 1).writeln(`throw e;`);
                }
            });
            for (let i = 0; i < distilledShapes.length; i++) {
                w.tab(tabLevel + (distilledShapes.length - i - 1)).writeln(`}`);
            }
            break;
        case 4 /* BaseShape.BOOLEAN */:
            e.markHelperAsUsed('checkBoolean');
            w.tab(tabLevel).writeln(`checkBoolean(${dataVar}, ${t.nullable}, ${fieldName});`);
            break;
        case 0 /* BaseShape.BOTTOM */:
            throw new TypeError('Impossible: Bottom should never appear in a type.');
        case 6 /* BaseShape.COLLECTION */:
            e.markHelperAsUsed('checkArray');
            w.tab(tabLevel).writeln(`checkArray(${dataVar}, ${fieldName});`);
            w.tab(tabLevel).writeln(`if (${dataVar}) {`);
            // Now, we check each element.
            w.tab(tabLevel + 1).writeln(`for (let i = 0; i < ${dataVar}.length; i++) {`);
            emitProxyTypeCheck(e, w, t.baseShape, tabLevel + 2, `${dataVar}[i]`, `${fieldName} + "[" + i + "]"`);
            w.tab(tabLevel + 1).writeln(`}`);
            w.tab(tabLevel).writeln(`}`);
            break;
        case 1 /* BaseShape.NULL */:
            e.markHelperAsUsed('checkNull');
            w.tab(tabLevel).writeln(`checkNull(${dataVar}, ${fieldName});`);
            break;
        case 5 /* BaseShape.NUMBER */:
            e.markHelperAsUsed('checkNumber');
            w.tab(tabLevel).writeln(`checkNumber(${dataVar}, ${t.nullable}, ${fieldName});`);
            break;
        case 2 /* BaseShape.RECORD */:
            // Convert into a proxy.
            w.tab(tabLevel).writeln(`${dataVar} = ${t.getProxyClass(e)}.Create(${dataVar}, ${fieldName});`);
            break;
        case 3 /* BaseShape.STRING */:
            e.markHelperAsUsed('checkString');
            w.tab(tabLevel).writeln(`checkString(${dataVar}, ${t.nullable}, ${fieldName});`);
            break;
    }
    // Standardize undefined into null.
    /*
    if (t.nullable) {
      w.tab(tabLevel).writeln(`if (${dataVar} === undefined) {`)
      w.tab(tabLevel + 1).writeln(`${dataVar} = null;`);
      w.tab(tabLevel).writeln(`}`);
    }
    */
}
