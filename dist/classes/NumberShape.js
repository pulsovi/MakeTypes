import { Shape } from "./Shape.js";
export class NumberShape extends Shape {
    get type() {
        return 5 /* BaseShape.NUMBER */;
    }
    emitType(e) {
        e.interfaces.write(this.getProxyType(e));
    }
    getProxyType(e) {
        return "number";
    }
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, earlyReturnVar, asCheckMultiArm = false, }) {
        emitter.markHelperAsUsed('checkNumber');
        if (indentFirstLine)
            emitter.proxies.tab(tabLevel);
        if (asCheckMultiArm) {
            emitter.proxies.writeln(`return checkNumber(${dataVar}, ${fieldName}, ${shouldThrow});`);
        }
        else if (earlyReturnVar) {
            emitter.proxies.writeln(`if (!checkNumber(${dataVar}, ${fieldName}, ${shouldThrow})) return ${earlyReturnVar};`);
        }
        else {
            emitter.proxies.writeln(`checkNumber(${dataVar}, ${fieldName}, ${shouldThrow});`);
        }
    }
}
