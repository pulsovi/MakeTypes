import { getReferencedRecordShapes } from "../functions/getReferencedRecordShapes.js";
import { safeField, safeInterfaceName, safeObjectField } from "../functions/sanitize.js";
import { CollectionShape } from "./CollectionShape.js";
import { FieldContext } from "./FieldContext.js";
import { NeverShape } from "./NeverShape.js";
import { Shape } from "./Shape.js";
export class RecordShape extends Shape {
    get type() {
        return 2 /* BaseShape.RECORD */;
    }
    _fields;
    contexts;
    _name = null;
    constructor(args) {
        super(args);
        // Assign a context to all fields.
        const fieldsWithContext = new Map();
        args.fields.forEach((val, index) => {
            if (val instanceof RecordShape || val instanceof CollectionShape) {
                fieldsWithContext.set(index, val.addContext(new FieldContext(this, index)));
            }
            else {
                fieldsWithContext.set(index, val);
            }
        });
        this._fields = fieldsWithContext;
        this.contexts = args.contexts ?? [];
    }
    get optional() {
        return this._optional;
    }
    /**
     * Construct a new record shape. Returns an existing, equivalent record shape
     * if applicable.
     */
    static Create(e, { fields, optional = false, contexts = [], samples = [] }) {
        const record = new RecordShape({ fields, optional, contexts, samples });
        return e.registerRecordShape(record);
    }
    clone(options) {
        return new RecordShape({
            contexts: this.contexts,
            fields: new Map(this._fields),
            optional: this._optional,
            samples: this.samples.slice(),
            ...options,
        });
    }
    addContext(ctx) {
        this.contexts.push(ctx);
        return this;
    }
    forEachField(cb) {
        [...this._fields.entries()]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([name, t]) => cb(t, name));
    }
    hasField(name) {
        return this._fields.has(name);
    }
    getField(name) {
        return this._fields.get(name) ?? new NeverShape();
    }
    equal(t) {
        if (super.equal(t) && this._fields.size === t._fields.size) {
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
    }
    getProxyClass(e) {
        return `${this.getName(e)}${e.postfixProxy ? 'Proxy' : ''}`;
    }
    getProxyType(e) {
        return `${this.getName(e)}${e.postfixProxy ? 'Proxy' : ''}`;
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
            if (t.optional)
                w.write("?");
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
            if (process.argv.includes('-debug'))
                w.tab(1).writeln(`// samples: ${JSON.stringify(t.samples)}`);
            w.tab(1).writeln(`public readonly ${safeField(name)}${t.optional ? '?' : ''}: ${t.getProxyType(e)};`);
        });
        w.tab(1).writeln(`public static Parse(d: string): ${this.getProxyType(e)} {`);
        w.tab(2).writeln(`return ${this.getProxyClass(e)}.Create(JSON.parse(d));`);
        w.tab(1).writeln(`}`);
        w.tab(1).writeln(`public static Create(d: any, field?: string, multiple ?: string): ${this.getProxyType(e)} {`);
        w.tab(2).writeln(`if (!field) {`);
        w.tab(3).writeln(`obj = d;`);
        w.tab(3).writeln(`field = "root";`);
        w.tab(2).writeln(`}`);
        w.tab(2).writeln(`if (!d) {`);
        e.markHelperAsUsed('throwNull2NonNull');
        w.tab(3).writeln(`throwNull2NonNull(field, d, multiple ?? this.name);`);
        w.tab(2).writeln(`} else if (typeof(d) !== 'object') {`);
        e.markHelperAsUsed('throwNotObject');
        w.tab(3).writeln(`throwNotObject(field, d);`);
        w.tab(2).writeln(`} else if (Array.isArray(d)) {`);
        e.markHelperAsUsed('throwIsArray');
        w.tab(3).writeln(`throwIsArray(field, d);`);
        w.tab(2).writeln(`}`);
        // At this point, we know we have a non-null object.
        // Check all fields.
        this.forEachField((t, name) => {
            if (t.optional)
                w.tab(2).writeln(`if (${JSON.stringify(name)} in d) {`);
            t.emitProxyTypeCheck({ emitter: e, tabLevel: 2 + (t.optional ? 1 : 0), dataVar: safeObjectField('d', name), fieldName: `field + ".${name}"` });
            if (t.optional)
                w.tab(2).writeln(`}`);
        });
        // disallow unknown fields
        const fieldNames = [];
        this.forEachField((t, name) => { fieldNames.push(name); });
        w.tab(2).writeln(`const knownProperties = ${JSON.stringify(fieldNames)};`);
        w.tab(2).writeln(`const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));`);
        w.tab(2).writeln(`if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");`);
        // create instance
        w.tab(2).writeln(`return new ${this.getProxyClass(e)}(d);`);
        w.tab(1).writeln(`}`);
        w.tab(1).writeln(`private constructor(d: any) {`);
        // Emit an assignment for each field.
        this.forEachField((t, name) => {
            w.tab(2)
                .write(t.optional ? `if (${JSON.stringify(name)} in d) ` : '')
                .writeln(`${safeObjectField('this', name)} = ${safeObjectField('d', name)};`);
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
    emitProxyTypeCheck({ emitter, tabLevel, dataVar, fieldName, multiple }) {
        emitter.proxies.tab(tabLevel)
            .writeln(`${dataVar} = ${this.getProxyClass(emitter)}.Create(${dataVar}, ${fieldName}${multiple ? `, ${multiple}` : ''});`);
    }
}
