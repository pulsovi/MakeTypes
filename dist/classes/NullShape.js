import { emitCreateContinuum } from "./CreateContinuumEmission.js";
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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, earlyReturnVar, asCheckMultiArm = false, }) {
        emitCreateContinuum({
            writer: emitter.proxies,
            session: emitter,
            mode: asCheckMultiArm
                ? { kind: "checkMultiArm" }
                : earlyReturnVar
                    ? { kind: "createEarlyReturn", returnBinding: earlyReturnVar }
                    : { kind: "bare" },
            check: "checkNull",
            dataVar,
            fieldName,
            shouldThrow,
            tabLevel,
            indentFirstLine,
        });
    }
}
