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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }) {
        emitter.markHelperAsUsed('checkNever');
        emitter.proxies.tab(tabLevel).writeln(`checkNever(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
    }
}
