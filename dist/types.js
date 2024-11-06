import { emitProxyTypeCheck } from './emit.js';
// Add any more invalid charachaters here 
const invalidChars = /[0-9-+\*\/\?: ]/g;
function safeField(field) {
    return field.match(invalidChars)
        ? `"${field}"`
        : field;
}
function safeInterfaceName(name) {
    return name.match(invalidChars) ? name.replace(invalidChars, "_") : name;
}
function safeObjectField(objectName, field) {
    return field.match(invalidChars)
        ? `${objectName}["${field}"]`
        : `${objectName}.${field}`;
}
function pascalCase(n) {
    return n.split("_").map((s) => (s[0] ? s[0].toUpperCase() : "") + s.slice(1)).join("");
}
export function getReferencedRecordShapes(e, s, sh) {
    switch (sh.type) {
        case 2 /* BaseShape.RECORD */:
            if (!s.has(sh)) {
                s.add(sh);
                sh.getReferencedRecordShapes(e, s);
            }
            break;
        case 6 /* BaseShape.COLLECTION */:
            getReferencedRecordShapes(e, s, sh.baseShape);
            break;
        case 7 /* BaseShape.ANY */:
            sh.getDistilledShapes(e).forEach((sh) => getReferencedRecordShapes(e, s, sh));
            break;
    }
}
export class FieldContext {
    get type() {
        return 1 /* ContextType.FIELD */;
    }
    parent;
    field;
    constructor(parent, field) {
        this.parent = parent;
        this.field = field;
    }
    getName(e) {
        const name = pascalCase(this.field);
        return name;
    }
}
export class EntityContext {
    get type() {
        return 0 /* ContextType.ENTITY */;
    }
    parent;
    constructor(parent) {
        this.parent = parent;
    }
    getName(e) {
        return `${this.parent.getName(e)}Entity`;
    }
}
export class CBottomShape {
    get type() {
        return 0 /* BaseShape.BOTTOM */;
    }
    get nullable() {
        return false;
    }
    makeNullable() {
        throw new TypeError(`Doesn't make sense.`);
    }
    makeNonNullable() {
        return this;
    }
    emitType(e) {
        throw new Error(`Doesn't make sense.`);
    }
    getProxyType(e) {
        throw new Error(`Doesn't make sense.`);
    }
    equal(t) {
        return this === t;
    }
}
export const BottomShape = new CBottomShape();
export class CNullShape {
    get nullable() {
        return true;
    }
    get type() {
        return 1 /* BaseShape.NULL */;
    }
    makeNullable() {
        return this;
    }
    makeNonNullable() {
        return this;
    }
    emitType(e) {
        e.interfaces.write("null");
    }
    getProxyType(e) {
        return "null";
    }
    equal(t) {
        return this === t;
    }
}
export const NullShape = new CNullShape();
export class CNumberShape {
    get nullable() {
        return this === NullableNumberShape;
    }
    get type() {
        return 5 /* BaseShape.NUMBER */;
    }
    makeNullable() {
        return NullableNumberShape;
    }
    makeNonNullable() {
        return NumberShape;
    }
    emitType(e) {
        e.interfaces.write(this.getProxyType(e));
    }
    getProxyType(e) {
        let rv = "number";
        if (this.nullable) {
            rv += " | null";
        }
        return rv;
    }
    equal(t) {
        return this === t;
    }
}
export const NumberShape = new CNumberShape();
export const NullableNumberShape = new CNumberShape();
export class CStringShape {
    get type() {
        return 3 /* BaseShape.STRING */;
    }
    get nullable() {
        return this === NullableStringShape;
    }
    makeNullable() {
        return NullableStringShape;
    }
    makeNonNullable() {
        return StringShape;
    }
    emitType(e) {
        e.interfaces.write(this.getProxyType(e));
    }
    getProxyType(e) {
        let rv = "string";
        if (this.nullable) {
            rv += " | null";
        }
        return rv;
    }
    equal(t) {
        return this === t;
    }
}
export const StringShape = new CStringShape();
export const NullableStringShape = new CStringShape();
export class CBooleanShape {
    get type() {
        return 4 /* BaseShape.BOOLEAN */;
    }
    get nullable() {
        return this === NullableBooleanShape;
    }
    makeNullable() {
        return NullableBooleanShape;
    }
    makeNonNullable() {
        return BooleanShape;
    }
    emitType(e) {
        e.interfaces.write(this.getProxyType(e));
    }
    getProxyType(e) {
        let rv = "boolean";
        if (this.nullable) {
            rv += " | null";
        }
        return rv;
    }
    equal(t) {
        return this === t;
    }
}
export const BooleanShape = new CBooleanShape();
export const NullableBooleanShape = new CBooleanShape();
export class CAnyShape {
    get type() {
        return 7 /* BaseShape.ANY */;
    }
    _shapes;
    _nullable = false;
    _hasDistilledShapes = false;
    _distilledShapes = [];
    constructor(shapes, nullable) {
        this._shapes = shapes;
        this._nullable = nullable;
    }
    get nullable() {
        return this._nullable === true;
    }
    makeNullable() {
        if (this._nullable) {
            return this;
        }
        else {
            return new CAnyShape(this._shapes, true);
        }
    }
    makeNonNullable() {
        if (this._nullable) {
            return new CAnyShape(this._shapes, false);
        }
        else {
            return this;
        }
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
                let shape = BottomShape;
                for (let i = 0; i < shapes.length; i++) {
                    shape = csh(e, shape, shapes[i]);
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
        const shapeClone = this._shapes.slice(0);
        shapeClone.push(shape);
        return new CAnyShape(shapeClone, this._nullable);
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
}
export class CRecordShape {
    get type() {
        return 2 /* BaseShape.RECORD */;
    }
    _nullable;
    _fields;
    contexts;
    _name = null;
    constructor(fields, nullable, contexts) {
        // Assign a context to all fields.
        const fieldsWithContext = new Map();
        fields.forEach((val, index) => {
            if (val.type === 2 /* BaseShape.RECORD */ || val.type === 6 /* BaseShape.COLLECTION */) {
                fieldsWithContext.set(index, val.addContext(new FieldContext(this, index)));
            }
            else {
                fieldsWithContext.set(index, val);
            }
        });
        this._fields = fieldsWithContext;
        this._nullable = nullable;
        this.contexts = contexts;
    }
    get nullable() {
        return this._nullable;
    }
    /**
     * Construct a new record shape. Returns an existing, equivalent record shape
     * if applicable.
     */
    static Create(e, fields, nullable, contexts = []) {
        const record = new CRecordShape(fields, nullable, contexts);
        return e.registerRecordShape(record);
    }
    makeNullable() {
        if (this._nullable) {
            return this;
        }
        else {
            return new CRecordShape(this._fields, true, this.contexts);
        }
    }
    addContext(ctx) {
        this.contexts.push(ctx);
        return this;
    }
    makeNonNullable() {
        if (this._nullable) {
            return new CRecordShape(this._fields, false, this.contexts);
        }
        else {
            return this;
        }
    }
    forEachField(cb) {
        this._fields.forEach(cb);
    }
    getField(name) {
        const t = this._fields.get(name);
        if (!t) {
            return NullShape;
        }
        else {
            return t;
        }
    }
    equal(t) {
        if (t.type === 2 /* BaseShape.RECORD */ && this._nullable === t._nullable && this._fields.size === t._fields.size) {
            let rv = true;
            const tFields = t._fields;
            // Check all fields.
            // NOTE: Since size is equal, no need to iterate over t. Either they have the same fields
            // or t is missing fields from this one.
            this.forEachField((t, name) => {
                if (rv) {
                    const field = tFields.get(name);
                    if (field) {
                        rv = field.equal(t);
                    }
                    else {
                        rv = false;
                    }
                }
            });
            return rv;
        }
        return false;
    }
    emitType(e) {
        e.interfaces.write(this.getName(e));
        if (this.nullable) {
            e.interfaces.write(" | null");
        }
    }
    getProxyClass(e) {
        return `${this.getName(e)}Proxy`;
    }
    getProxyType(e) {
        let rv = `${this.getName(e)}Proxy`;
        if (this.nullable) {
            rv += " | null";
        }
        return rv;
    }
    emitInterfaceDefinition(e) {
        const w = e.interfaces;
        if (e.typeOfObject === 'type') {
            w.write(`export type ${this.getName(e)} = {`).endl();
        }
        else {
            w.write(`export interface ${this.getName(e)} {`).endl();
        }
        this.forEachField((t, name) => {
            w.tab(1).write(safeField(name));
            if (t.nullable) {
                w.write("?");
            }
            w.write(": ");
            t.emitType(e);
            w.write(";").endl();
        });
        w.write(`}`);
    }
    emitProxyClass(e) {
        const w = e.proxies;
        w.writeln(`export class ${this.getProxyClass(e)} {`);
        this.forEachField((t, name) => {
            w.tab(1).writeln(`public readonly ${safeField(name)}: ${t.getProxyType(e)};`);
        });
        w.tab(1).writeln(`public static Parse(d: string): ${this.getProxyType(e)} {`);
        w.tab(2).writeln(`return ${this.getProxyClass(e)}.Create(JSON.parse(d));`);
        w.tab(1).writeln(`}`);
        w.tab(1).writeln(`public static Create(d: any, field: string = 'root'): ${this.getProxyType(e)} {`);
        w.tab(2).writeln(`if (!field) {`);
        w.tab(3).writeln(`obj = d;`);
        w.tab(3).writeln(`field = "root";`);
        w.tab(2).writeln(`}`);
        w.tab(2).writeln(`if (d === null || d === undefined) {`);
        w.tab(3);
        if (this.nullable) {
            w.writeln(`return null;`);
        }
        else {
            e.markHelperAsUsed('throwNull2NonNull');
            w.writeln(`throwNull2NonNull(field, d);`);
        }
        w.tab(2).writeln(`} else if (typeof(d) !== 'object') {`);
        e.markHelperAsUsed('throwNotObject');
        w.tab(3).writeln(`throwNotObject(field, d, ${this.nullable});`);
        w.tab(2).writeln(`} else if (Array.isArray(d)) {`);
        e.markHelperAsUsed('throwIsArray');
        w.tab(3).writeln(`throwIsArray(field, d, ${this.nullable});`);
        w.tab(2).writeln(`}`);
        // At this point, we know we have a non-null object.
        // Check all fields.
        this.forEachField((t, name) => {
            emitProxyTypeCheck(e, w, t, 2, `${safeObjectField('d', name)}`, `field + ".${name}"`);
        });
        w.tab(2).writeln(`return new ${this.getProxyClass(e)}(d);`);
        w.tab(1).writeln(`}`);
        w.tab(1).writeln(`private constructor(d: any) {`);
        // Emit an assignment for each field.
        this.forEachField((t, name) => {
            w.tab(2).writeln(`${safeObjectField('this', name)} = ${safeObjectField('d', name)};`);
        });
        w.tab(1).writeln(`}`);
        w.writeln('}');
    }
    getReferencedRecordShapes(e, rv) {
        this.forEachField((t, name) => {
            getReferencedRecordShapes(e, rv, t);
        });
    }
    markAsRoot(name) {
        this._name = name;
    }
    getName(e) {
        if (typeof (this._name) === 'string') {
            return this._name;
        }
        // Calculate unique name.
        const nameSet = new Set();
        let name = this.contexts
            .map((c) => c.getName(e))
            // Remove duplicate names.
            .filter((n) => {
            if (!nameSet.has(n)) {
                nameSet.add(n);
                return true;
            }
            return false;
        })
            .join("Or");
        // Replace invalid Typescript charachters
        name = safeInterfaceName(name);
        this._name = e.registerName(name);
        return this._name;
    }
}
export class CCollectionShape {
    get type() {
        return 6 /* BaseShape.COLLECTION */;
    }
    baseShape;
    contexts;
    _name = null;
    constructor(baseShape, contexts = []) {
        // Add context if a record/collection.
        this.baseShape = (baseShape.type === 2 /* BaseShape.RECORD */ || baseShape.type === 6 /* BaseShape.COLLECTION */) ? baseShape.addContext(new EntityContext(this)) : baseShape;
        this.contexts = contexts;
    }
    get nullable() {
        return true;
    }
    makeNullable() {
        return this;
    }
    makeNonNullable() {
        return this;
    }
    addContext(ctx) {
        this.contexts.push(ctx);
        return this;
    }
    emitType(e) {
        e.interfaces.write("(");
        this.baseShape.emitType(e);
        e.interfaces.write(")[] | null");
    }
    getProxyType(e) {
        const base = this.baseShape.getProxyType(e);
        if (base.indexOf("|") !== -1) {
            return `(${base})[] | null`;
        }
        else {
            return `${base}[] | null`;
        }
    }
    equal(t) {
        return t.type === 6 /* BaseShape.COLLECTION */ && this.baseShape.equal(t.baseShape);
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
}
export function csh(e, s1, s2) {
    // csh(σ, σ) = σ
    if (s1 === s2) {
        return s1;
    }
    if (s1.type === 6 /* BaseShape.COLLECTION */ && s2.type === 6 /* BaseShape.COLLECTION */) {
        // csh([σ1], [σ2]) = [csh(σ1, σ2)]
        return new CCollectionShape(csh(e, s1.baseShape, s2.baseShape));
    }
    // csh(⊥, σ) = csh(σ, ⊥) = σ
    if (s1.type === 0 /* BaseShape.BOTTOM */) {
        return s2;
    }
    if (s2.type === 0 /* BaseShape.BOTTOM */) {
        return s1;
    }
    // csh(null, σ) = csh(σ, null) = nullable<σ>
    if (s1.type === 1 /* BaseShape.NULL */) {
        return s2.makeNullable();
    }
    if (s2.type === 1 /* BaseShape.NULL */) {
        return s1.makeNullable();
    }
    // csh(any, σ) = csh(σ, any) = any
    if (s1.type === 7 /* BaseShape.ANY */) {
        return s1.addToShapes(s2);
    }
    if (s2.type === 7 /* BaseShape.ANY */) {
        return s2.addToShapes(s1);
    }
    // csh(σ2, nullable<σˆ1> ) = csh(nullable<σˆ1> , σ2) = nullable<csh(σˆ1, σ2)>
    if (s1.nullable && s1.type !== 6 /* BaseShape.COLLECTION */) {
        return csh(e, s1.makeNonNullable(), s2).makeNullable();
    }
    if (s2.nullable && s2.type !== 6 /* BaseShape.COLLECTION */) {
        return csh(e, s2.makeNonNullable(), s1).makeNullable();
    }
    // (recd) rule
    if (s1.type === 2 /* BaseShape.RECORD */ && s2.type === 2 /* BaseShape.RECORD */) {
        // Get all fields.
        const fields = new Map();
        s1.forEachField((t, name) => {
            fields.set(name, csh(e, t, s2.getField(name)));
        });
        s2.forEachField((t, name) => {
            if (!fields.has(name)) {
                fields.set(name, csh(e, t, s1.getField(name)));
            }
        });
        return CRecordShape.Create(e, fields, false);
    }
    // (any) rule
    return new CAnyShape([s1, s2], s1.nullable || s2.nullable);
}
export function d2s(e, d) {
    if (d === undefined || d === null) {
        return NullShape;
    }
    switch (typeof (d)) {
        case 'number':
            return NumberShape;
        case 'string':
            return StringShape;
        case 'boolean':
            return BooleanShape;
    }
    // Must be an object or array.
    if (Array.isArray(d)) {
        // Empty array: Not enough information to figure out a precise type.
        if (d.length === 0) {
            return new CCollectionShape(NullShape);
        }
        let t = BottomShape;
        for (let i = 0; i < d.length; i++) {
            t = csh(e, t, d2s(e, d[i]));
        }
        return new CCollectionShape(t);
    }
    const keys = Object.keys(d);
    const fields = new Map();
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        fields.set(name, d2s(e, d[name]));
    }
    return CRecordShape.Create(e, fields, false);
}
