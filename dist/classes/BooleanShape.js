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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple, }) {
        emitter.markHelperAsUsed('checkBoolean');
        emitter.proxies.tab(tabLevel).writeln(`checkBoolean(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
    }
}
