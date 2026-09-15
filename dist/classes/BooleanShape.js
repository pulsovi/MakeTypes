import { Shape } from "./Shape.js";
export class BooleanShape extends Shape {
    get type() {
        return 4 /* BaseShape.BOOLEAN */;
    }
    emitType(e) {
        e.interfaces.write(this.getProxyType(e));
    }
    getProxyType(e) {
        return "boolean";
    }
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, earlyReturnVar, asCheckMultiArm = false, }) {
        emitter.markHelperAsUsed('checkBoolean');
        if (indentFirstLine)
            emitter.proxies.tab(tabLevel);
        if (asCheckMultiArm) {
            emitter.proxies.writeln(`return checkBoolean(${dataVar}, ${fieldName}, ${shouldThrow});`);
        }
        else if (earlyReturnVar) {
            emitter.proxies.writeln(`if (!checkBoolean(${dataVar}, ${fieldName}, ${shouldThrow})) return ${earlyReturnVar};`);
        }
        else {
            emitter.proxies.writeln(`checkBoolean(${dataVar}, ${fieldName}, ${shouldThrow});`);
        }
    }
}
