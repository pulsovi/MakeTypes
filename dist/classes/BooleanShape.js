import { emitCreateContinuum } from "./CreateContinuumEmission.js";
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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, earlyReturnVar, asCheckMultiArm = false, }) {
        emitCreateContinuum({
            writer: emitter.proxies,
            session: emitter,
            mode: asCheckMultiArm
                ? { kind: "checkMultiArm" }
                : earlyReturnVar
                    ? { kind: "createEarlyReturn", returnBinding: earlyReturnVar }
                    : { kind: "bare" },
            check: "checkBoolean",
            dataVar,
            fieldName,
            shouldThrow,
            tabLevel,
            indentFirstLine,
        });
    }
}
