import { Shape } from "./Shape.js";
export class NeverShape extends Shape {
    get type() {
        return 8 /* BaseShape.NEVER */;
    }
    get optional() {
        return true;
    }
    makeOptional() {
        return this;
    }
    makeNonOptional() {
        throw new Error(`Doesn't make sense.`);
    }
    emitType(e) {
        e.interfaces.write(this.getProxyType(e));
    }
    getProxyType(e) {
        return "never";
    }
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, earlyReturnVar, asCheckMultiArm = false, }) {
        emitter.markHelperAsUsed('checkNever');
        if (indentFirstLine)
            emitter.proxies.tab(tabLevel);
        if (asCheckMultiArm) {
            emitter.proxies.writeln(`return checkNever(${dataVar}, ${fieldName}, ${shouldThrow});`);
        }
        else if (earlyReturnVar) {
            emitter.proxies.writeln(`if (!checkNever(${dataVar}, ${fieldName}, ${shouldThrow})) return ${earlyReturnVar};`);
        }
        else {
            emitter.proxies.writeln(`checkNever(${dataVar}, ${fieldName}, ${shouldThrow});`);
        }
    }
}
