import { emitCreateContinuum, } from "./CreateContinuumEmission.js";
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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, mode, }) {
        emitCreateContinuum({
            writer: emitter.proxies,
            session: emitter,
            mode: mode,
            check: "checkNumber",
            dataVar,
            fieldName,
            shouldThrow,
            tabLevel,
            indentFirstLine,
        });
    }
}
