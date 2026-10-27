import { emitCreateContinuum } from "./CreateContinuumEmission.js";
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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, earlyReturnVar, asCheckMultiArm = false, }) {
        emitCreateContinuum({
            writer: emitter.proxies,
            session: emitter,
            mode: asCheckMultiArm
                ? { kind: "checkMultiArm" }
                : earlyReturnVar
                    ? { kind: "createEarlyReturn", returnBinding: earlyReturnVar }
                    : { kind: "bare" },
            check: "checkNumber",
            dataVar,
            fieldName,
            shouldThrow,
            tabLevel,
            indentFirstLine,
        });
    }
}
