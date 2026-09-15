import { EntityContext } from "./EntityContext.js";
import { RecordShape } from "./RecordShape.js";
import { Shape } from "./Shape.js";
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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, indentFirstLine = true, earlyReturnVar, asCheckMultiArm = false, }) {
        const writter = emitter.proxies;
        const typeLabel = `${this.baseShape.getProxyType(emitter)}[]`;
        emitter.markHelperAsUsed('checkArray');
        if (indentFirstLine)
            writter.tab(tabLevel);
        if (asCheckMultiArm) {
            writter.writeln(`if (!checkArray(${dataVar}, ${fieldName}, "${typeLabel}", ${shouldThrow})) return false;`);
        }
        else if (earlyReturnVar) {
            writter.writeln(`if (!checkArray(${dataVar}, ${fieldName}, "${typeLabel}", ${shouldThrow})) return ${earlyReturnVar};`);
        }
        else {
            writter.writeln(`if (checkArray(${dataVar}, ${fieldName}, "${typeLabel}", ${shouldThrow})) {`);
        }
        const loopTab = (!asCheckMultiArm && !earlyReturnVar) ? tabLevel + 1 : tabLevel;
        writter.tab(loopTab).writeln(`for (let i = 0; i < ${dataVar}.length; i++) {`);
        this.baseShape.emitProxyTypeCheck({
            emitter,
            tabLevel: loopTab + 1,
            dataVar: `${dataVar}[i]`,
            fieldName: `${fieldName} + "[" + i + "]"`,
            shouldThrow,
            earlyReturnVar: asCheckMultiArm ? 'false' : earlyReturnVar,
            abortRecordSoftFail: asCheckMultiArm,
            asCheckMultiArm: false,
        });
        writter.tab(loopTab).writeln(`}`);
        if (asCheckMultiArm) {
            writter.tab(tabLevel).writeln(`return true;`);
        }
        else if (!earlyReturnVar) {
            writter.tab(tabLevel).writeln(`}`);
        }
    }
}
