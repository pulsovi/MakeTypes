import { emitCreateContinuum } from "./CreateContinuumEmission.js";
import { Shape } from "./Shape.js";
export class NeverShape extends Shape {
    get type() {
        return 8 /* BaseShape.NEVER */;
    }
    get optional() {
        return true;
    }
    makeOptional() {
        return this;
    }
    makeNonOptional() {
        throw new Error(`Doesn't make sense.`);
    }
    emitType(e) {
        e.interfaces.write(this.getProxyType(e));
    }
    getProxyType(e) {
        return "never";
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
            check: "checkNever",
            dataVar,
            fieldName,
            shouldThrow,
            tabLevel,
            indentFirstLine,
        });
    }
}
