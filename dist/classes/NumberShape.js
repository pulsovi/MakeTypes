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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }) {
        emitter.markHelperAsUsed('checkNumber');
        emitter.proxies.tab(tabLevel).writeln(`checkNumber(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
    }
}
