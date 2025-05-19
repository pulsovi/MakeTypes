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
        // TODO: This is terrible.
        const distilledShapes = this.getDistilledShapes(emitter);
        writter.tab(tabLevel).writeln(`// This will be refactored in the next release.`);
        distilledShapes.forEach((subShape, i) => {
            writter.tab(tabLevel + i).writeln(`try {`);
            subShape.emitProxyTypeCheck({
                emitter,
                tabLevel: tabLevel + i + 1,
                dataVar,
                fieldName,
                multiple: `"${this.getProxyType(emitter)}"`,
            });
            writter.tab(tabLevel + i).writeln(`} catch (e) {`);
            if (i === distilledShapes.length - 1) {
                writter.tab(tabLevel + i + 1).writeln(`prompt(proxyName+':', JSON.stringify(obj));`);
                if (process.argv.includes('-debug'))
                    writter.tab(tabLevel + i + 1).writeln(`throw e;`);
            }
        });
        for (let i = 0; i < distilledShapes.length; i++) {
            writter.tab(tabLevel + (distilledShapes.length - i - 1)).writeln(`}`);
        }
    }
}
