import { emitCreateContinuum, } from "./CreateContinuumEmission.js";
import { EntityContext } from "./EntityContext.js";
import { RecordShape } from "./RecordShape.js";
import { Shape } from "./Shape.js";
function continuumModeForCollectionChild(parentMode, baseShape, emitter) {
    if (baseShape instanceof RecordShape) {
        const proxyClass = baseShape.getProxyClass(emitter);
        if (parentMode.kind === "checkMultiArm") {
            return {
                kind: "recordNestedAbort",
                proxyClass,
                returnBinding: "false",
            };
        }
        return { kind: "recordNestedLocal", proxyClass };
    }
    if (parentMode.kind === "checkMultiArm") {
        return { kind: "createEarlyReturn", returnBinding: "false" };
    }
    return parentMode;
}
export class CollectionShape extends Shape {
    baseShape;
    contexts;
    _name = null;
    constructor({ baseShape, optional = false, contexts = [], samples = [], }) {
        super({ optional, samples });
        // Add context if a record/collection.
        this.baseShape = (baseShape instanceof RecordShape || baseShape instanceof CollectionShape)
            ? baseShape.addContext(new EntityContext(this))
            : baseShape;
        this.contexts = contexts;
    }
    clone(options) {
        return new CollectionShape({
            baseShape: this.baseShape,
            optional: this._optional,
            samples: this.samples.slice(),
            contexts: this.contexts.slice(),
            ...options,
        });
    }
    get type() {
        return 6 /* BaseShape.COLLECTION */;
    }
    addContext(ctx) {
        this.contexts.push(ctx);
        return this;
    }
    emitType(e) {
        e.interfaces.write("(");
        this.baseShape.emitType(e);
        e.interfaces.write(")[]");
    }
    getProxyType(e) {
        const base = this.baseShape.getProxyType(e);
        return base.includes("|") ? `(${base})[]` : `${base}[]`;
    }
    equal(t) {
        return super.equal(t) && this.baseShape.equal(t.baseShape);
    }
    getName(e) {
        if (typeof (this._name) === 'string') {
            return this._name;
        }
        const nameSet = new Set();
        // No need to make collection names unique.
        this._name = this.contexts
            .map((c) => c.getName(e))
            .filter((name) => {
            if (!nameSet.has(name)) {
                nameSet.add(name);
                return true;
            }
            return false;
        })
            .join("Or");
        return this._name;
    }
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, mode, }) {
        const writter = emitter.proxies;
        const typeArg = `"${this.baseShape.getProxyType(emitter)}[]"`;
        const checkMode = mode;
        // checkArray gate: Create / multi-arm use continuum early-return; bare keeps `if (checkArray) { … }` framing.
        if (checkMode.kind === "checkMultiArm") {
            emitCreateContinuum({
                writer: writter,
                session: emitter,
                mode: { kind: "createEarlyReturn", returnBinding: "false" },
                check: "checkArray",
                type: typeArg,
                dataVar,
                fieldName,
                shouldThrow,
                tabLevel,
                indentFirstLine,
            });
        }
        else if (checkMode.kind === "createEarlyReturn") {
            emitCreateContinuum({
                writer: writter,
                session: emitter,
                mode: checkMode,
                check: "checkArray",
                type: typeArg,
                dataVar,
                fieldName,
                shouldThrow,
                tabLevel,
                indentFirstLine,
            });
        }
        else {
            emitter.markHelperAsUsed("checkArray");
            if (indentFirstLine)
                writter.tab(tabLevel);
            writter.writeln(`if (checkArray(${dataVar}, ${fieldName}, ${typeArg}, ${shouldThrow})) {`);
        }
        // Element loop framing stays here; child checks receive the continuum mode for their path.
        const loopTab = checkMode.kind === "bare" ? tabLevel + 1 : tabLevel;
        writter.tab(loopTab).writeln(`for (let i = 0; i < ${dataVar}.length; i++) {`);
        this.baseShape.emitProxyTypeCheck({
            emitter,
            tabLevel: loopTab + 1,
            dataVar: `${dataVar}[i]`,
            fieldName: `${fieldName} + "[" + i + "]"`,
            shouldThrow,
            mode: continuumModeForCollectionChild(checkMode, this.baseShape, emitter),
        });
        writter.tab(loopTab).writeln(`}`);
        if (checkMode.kind === "checkMultiArm") {
            writter.tab(tabLevel).writeln(`return true;`);
        }
        else if (checkMode.kind === "bare") {
            writter.tab(tabLevel).writeln(`}`);
        }
    }
}
