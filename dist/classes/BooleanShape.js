import { emitCreateContinuum, } from "./CreateContinuumEmission.js";
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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, mode, }) {
        emitCreateContinuum({
            writer: emitter.proxies,
            session: emitter,
            mode: mode,
            check: "checkBoolean",
            dataVar,
            fieldName,
            shouldThrow,
            tabLevel,
            indentFirstLine,
        });
    }
}
