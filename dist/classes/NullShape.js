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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }) {
        emitter.markHelperAsUsed('checkNull');
        emitter.proxies.tab(tabLevel).writeln(`checkNull(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
    }
}
