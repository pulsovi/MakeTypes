import { concateShapes } from "../functions/concateShapes.js";
import { bottomShape } from "./BottomShape.js";
import { Shape } from "./Shape.js";
export class AnyShape extends Shape {
    _shapes;
    _hasDistilledShapes = false;
    _distilledShapes = [];
    constructor({ optional, samples, shapes } = {}) {
        super({ samples, optional });
        this._shapes = shapes ?? [];
    }
    get type() {
        return 7 /* BaseShape.ANY */;
    }
    clone(args) {
        return new AnyShape({
            optional: this.optional,
            samples: this.samples.slice(),
            shapes: this._shapes.slice(),
            ...args,
        });
    }
    _ensureDistilled(e) {
        if (!this._hasDistilledShapes) {
            let shapes = new Map();
            for (let i = 0; i < this._shapes.length; i++) {
                const s = this._shapes[i];
                if (!shapes.has(s.type)) {
                    shapes.set(s.type, []);
                }
                shapes.get(s.type).push(s);
            }
            shapes.forEach((shapes, key) => {
                let shape = bottomShape;
                for (let i = 0; i < shapes.length; i++) {
                    shape = concateShapes(e, shape, shapes[i]);
                }
                this._distilledShapes.push(shape);
            });
            this._hasDistilledShapes = true;
        }
    }
    getDistilledShapes(e) {
        this._ensureDistilled(e);
        return this._distilledShapes;
    }
    addToShapes(shape) {
        return new AnyShape({
            shapes: this._shapes.concat(shape instanceof AnyShape ? shape._shapes : [shape]),
            samples: this.samples.concat(shape.samples),
            optional: this.optional || shape.optional,
        });
    }
    emitType(e) {
        this._ensureDistilled(e);
        this._distilledShapes.forEach((s, i) => {
            s.emitType(e);
            if (i < this._distilledShapes.length - 1) {
                e.interfaces.write(" | ");
            }
        });
    }
    getProxyType(e) {
        this._ensureDistilled(e);
        return this._distilledShapes.map((s) => s.getProxyType(e)).join(" | ");
    }
    equal(t) {
        return this === t;
    }
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, }) {
        const writter = emitter.proxies;
        const distilledShapes = this.getDistilledShapes(emitter);
        const baseFieldName = fieldName.slice(1, -1).split('.').pop();
        writter.tab(tabLevel).writeln(`const ${baseFieldName}TypeCheckers = [`);
        distilledShapes.forEach((subShape, i) => {
            writter.tab(tabLevel + 1).writeln(`() => {`);
            subShape.emitProxyTypeCheck({
                emitter,
                tabLevel: tabLevel + 2,
                dataVar,
                fieldName,
                multiple: `"${this.getProxyType(emitter)}"`,
            });
            writter.tab(tabLevel + 1).writeln(`},`);
        });
        writter.tab(tabLevel).writeln(`];`);
        writter.tab(tabLevel).writeln(`let ${baseFieldName}IsValid = false;`);
        writter.tab(tabLevel).writeln(`for (let i = 0; i < ${baseFieldName}TypeCheckers.length; i++) {`);
        writter.tab(tabLevel + 1).writeln(`try {`);
        writter.tab(tabLevel + 2).writeln(`${baseFieldName}TypeCheckers[i]();`);
        writter.tab(tabLevel + 2).writeln(`${baseFieldName}IsValid = true;`);
        writter.tab(tabLevel + 1).writeln(`} catch (e) { /* Do nothing */ }`);
        writter.tab(tabLevel).writeln(`}`);
        writter.tab(tabLevel).writeln(`if (!${baseFieldName}IsValid) {`);
        writter.tab(tabLevel + 1).writeln(`if (typeof globalThis.handleProxyError === 'function') {`);
        writter.tab(tabLevel + 2).writeln(`globalThis.handleProxyError(proxyName, obj, {`);
        writter.tab(tabLevel + 3).writeln(`path: ${fieldName}.split('.'),`);
        writter.tab(tabLevel + 3).writeln(`expectedType: ${JSON.stringify(this.getProxyType(emitter))},`);
        writter.tab(tabLevel + 3).writeln(`actualValue: ${dataVar},`);
        writter.tab(tabLevel + 2).writeln(`});`);
        writter.tab(tabLevel + 1).writeln(`}`);
        writter.tab(tabLevel).writeln(`}`);
    }
}
