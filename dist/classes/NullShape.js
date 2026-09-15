import { Shape } from "./Shape.js";
export class NullShape extends Shape {
    get type() {
        return 1 /* BaseShape.NULL */;
    }
    emitType(e) {
        e.interfaces.write("null");
    }
    getProxyType(e) {
        return "null";
    }
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, earlyReturnVar, asCheckMultiArm = false, }) {
        emitter.markHelperAsUsed('checkNull');
        if (indentFirstLine)
            emitter.proxies.tab(tabLevel);
        if (asCheckMultiArm) {
            emitter.proxies.writeln(`return checkNull(${dataVar}, ${fieldName}, ${shouldThrow});`);
        }
        else if (earlyReturnVar) {
            emitter.proxies.writeln(`if (!checkNull(${dataVar}, ${fieldName}, ${shouldThrow})) return ${earlyReturnVar};`);
        }
        else {
            emitter.proxies.writeln(`checkNull(${dataVar}, ${fieldName}, ${shouldThrow});`);
        }
    }
}
