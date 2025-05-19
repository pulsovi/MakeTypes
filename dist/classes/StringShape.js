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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }) {
        emitter.markHelperAsUsed('checkString');
        emitter.proxies.tab(tabLevel).writeln(`checkString(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
    }
}
