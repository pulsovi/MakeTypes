import { emitCreateContinuum } from "./CreateContinuumEmission.js";
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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, earlyReturnVar, asCheckMultiArm = false, }) {
        emitCreateContinuum({
            writer: emitter.proxies,
            session: emitter,
            mode: asCheckMultiArm
                ? { kind: "checkMultiArm" }
                : earlyReturnVar
                    ? { kind: "createEarlyReturn", returnBinding: earlyReturnVar }
                    : { kind: "bare" },
            check: "checkString",
            dataVar,
            fieldName,
            shouldThrow,
            tabLevel,
            indentFirstLine,
        });
    }
}
