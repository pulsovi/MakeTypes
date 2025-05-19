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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple, }) {
        const writter = emitter.proxies;
        emitter.markHelperAsUsed('checkArray');
        writter.tab(tabLevel).writeln(`checkArray(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
        writter.tab(tabLevel).writeln(`if (${dataVar}) {`);
        // Now, we check each element.
        writter.tab(tabLevel + 1).writeln(`for (let i = 0; i < ${dataVar}.length; i++) {`);
        this.baseShape.emitProxyTypeCheck({
            emitter,
            tabLevel: tabLevel + 2,
            dataVar: `${dataVar}[i]`,
            fieldName: `${fieldName} + "[" + i + "]"`
        });
        writter.tab(tabLevel + 1).writeln(`}`);
        writter.tab(tabLevel).writeln(`}`);
    }
}
