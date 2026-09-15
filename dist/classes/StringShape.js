import { Shape } from "./Shape.js";
export class StringShape extends Shape {
    get type() {
        return 3 /* BaseShape.STRING */;
    }
    emitType(emitter) {
        emitter.interfaces.write(this.getProxyType());
    }
    getProxyType() {
        return "string";
    }
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, earlyReturnVar, asCheckMultiArm = false, }) {
        emitter.markHelperAsUsed('checkString');
        if (indentFirstLine)
            emitter.proxies.tab(tabLevel);
        if (asCheckMultiArm) {
            emitter.proxies.writeln(`return checkString(${dataVar}, ${fieldName}, ${shouldThrow});`);
        }
        else if (earlyReturnVar) {
            emitter.proxies.writeln(`if (!checkString(${dataVar}, ${fieldName}, ${shouldThrow})) return ${earlyReturnVar};`);
        }
        else {
            emitter.proxies.writeln(`checkString(${dataVar}, ${fieldName}, ${shouldThrow});`);
        }
    }
}
