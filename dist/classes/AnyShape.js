import { concateShapes } from "../functions/concateShapes.js";
import { bottomShape } from "./BottomShape.js";
import { RecordShape } from "./RecordShape.js";
import { Shape } from "./Shape.js";
function continuumModeForAnyArm(subShape, emitter) {
    if (subShape instanceof RecordShape) {
        return {
            kind: "recordNestedMultiArm",
            proxyClass: subShape.getProxyClass(emitter),
        };
    }
    return { kind: "checkMultiArm" };
}
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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, shouldThrow = true, mode, }) {
        const writter = emitter.proxies;
        const distilledShapes = this.getDistilledShapes(emitter);
        const proxyType = JSON.stringify(this.getProxyType(emitter));
        const checkMode = mode;
        // checkMulti([…]) scaffolding stays here; arms receive checkMulti / Record nested multi-arm modes.
        emitter.markHelperAsUsed('checkMulti');
        if (checkMode.kind === "checkMultiArm") {
            writter.tab(tabLevel).write(`return `);
        }
        else if (checkMode.kind === "createEarlyReturn") {
            writter.tab(tabLevel).write(`if (!`);
        }
        else {
            writter.tab(tabLevel);
        }
        writter.writeln(`checkMulti([`);
        distilledShapes.forEach((subShape) => {
            writter.tab(tabLevel + 1).writeln(`() => {`);
            subShape.emitProxyTypeCheck({
                emitter,
                tabLevel: tabLevel + 2,
                dataVar,
                fieldName,
                shouldThrow: false,
                indentFirstLine: true,
                type: proxyType,
                mode: continuumModeForAnyArm(subShape, emitter),
            });
            writter.tab(tabLevel + 1).writeln(`},`);
        });
        if (checkMode.kind === "checkMultiArm") {
            writter.tab(tabLevel).writeln(`], ${dataVar}, ${fieldName}, ${proxyType}, ${shouldThrow});`);
        }
        else if (checkMode.kind === "createEarlyReturn") {
            writter.tab(tabLevel).writeln(`], ${dataVar}, ${fieldName}, ${proxyType}, ${shouldThrow})) return ${checkMode.returnBinding};`);
        }
        else {
            writter.tab(tabLevel).writeln(`], ${dataVar}, ${fieldName}, ${proxyType}, ${shouldThrow});`);
        }
    }
}
