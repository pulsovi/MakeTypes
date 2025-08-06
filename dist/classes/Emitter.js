import { dataToShape } from "../functions/dataToShape.js";
import { getReferencedRecordShapes } from "../functions/getReferencedRecordShapes.js";
import { CollectionShape } from "./CollectionShape.js";
import { RecordShape } from "./RecordShape.js";
export default class Emitter {
    _records = [];
    _claimedNames = new Set();
    interfaces;
    proxies;
    _helpersToEmit = new Set();
    /**
     * if true `Proxy` string will be added at the end of proxies name
     */
    postfixProxy;
    // The type of object being emitted.
    // some prefer interfaces, some prefer types.
    typeOfObject = 'interface';
    constructor(interfaces, proxies, options = {}) {
        this.interfaces = interfaces;
        this.proxies = proxies;
        this.typeOfObject = options.typeOfObject ?? 'interface';
        this.postfixProxy = ('postfixProxy' in options) ? options.postfixProxy : true;
    }
    markHelperAsUsed(n) {
        this._helpersToEmit.add(n);
    }
    emit(root, rootName) {
        let rootShape = dataToShape(this, root);
        if (rootShape instanceof CollectionShape) {
            rootShape = rootShape.baseShape;
        }
        this.proxies.writeln(`// Stores the currently-being-typechecked object for error messages.`);
        this.proxies.writeln(`const proxyName = '${rootName}${this.postfixProxy ? 'Proxy' : ''}';`);
        this.proxies.writeln(`let obj: any = null;`);
        if (!(rootShape instanceof RecordShape)) {
            this._claimedNames.add(rootName);
            const roots = new Set();
            getReferencedRecordShapes(this, roots, rootShape);
            let rootArray = new Array();
            roots.forEach((root) => rootArray.push(root));
            if (rootArray.length === 1) {
                this._emitRootRecordShape(`${rootName}Entity`, rootArray[0]);
            }
            else {
                for (let i = 0; i < rootArray.length; i++) {
                    this._emitRootRecordShape(`${rootName}Entity${i}`, rootArray[i]);
                }
            }
            this.interfaces.write(`export type ${rootName} = `);
            rootShape.emitType(this);
            this.interfaces.writeln(`;`).endl();
            this.proxies.writeln(`export class ${rootName}${this.postfixProxy ? 'Proxy' : ''} {`);
            this.proxies.tab(1).writeln(`public static Parse(s: string): ${rootShape.getProxyType(this)} {`);
            this.proxies.tab(2).writeln(`return ${rootName}${this.postfixProxy ? 'Proxy' : ''}.Create(JSON.parse(s));`);
            this.proxies.tab(1).writeln(`}`);
            this.proxies.tab(1).writeln(`public static Create(s: any, fieldName?: string): ${rootShape.getProxyType(this)} {`);
            this.proxies.tab(2).writeln(`if (!fieldName) {`);
            this.proxies.tab(3).writeln(`obj = s;`);
            this.proxies.tab(3).writeln(`fieldName = "root";`);
            this.proxies.tab(2).writeln(`}`);
            rootShape.emitProxyTypeCheck({
                emitter: this,
                tabLevel: 2,
                dataVar: 's',
                fieldName: "fieldName",
            });
            if (rootShape.type !== 8 /* BaseShape.NEVER */)
                this.proxies.tab(2).writeln(`return s;`);
            this.proxies.tab(1).writeln(`}`);
            this.proxies.writeln(`}`).endl();
        }
        else {
            this._emitRootRecordShape(rootName, rootShape);
        }
        this._emitProxyHelpers();
    }
    _emitRootRecordShape(name, rootShape) {
        this._claimedNames.add(name);
        rootShape.markAsRoot(name);
        rootShape.emitInterfaceDefinition(this);
        rootShape.emitProxyClass(this);
        this.interfaces.endl();
        this.proxies.endl();
        const set = new Set();
        rootShape.getReferencedRecordShapes(this, set);
        set.forEach((shape) => {
            shape.emitInterfaceDefinition(this);
            shape.emitProxyClass(this);
            this.interfaces.endl();
            this.proxies.endl();
        });
    }
    _emitProxyHelpers() {
        const w = this.proxies;
        const s = this._helpersToEmit;
        if (s.has('throwNull2NonNull')) {
            this.markHelperAsUsed("errorHelper");
            if (process.argv.includes('-debug'))
                w.writeln(`function throwNull2NonNull(field: string, value: any, multiple?: string): never {`);
            else
                w.writeln(`function throwNull2NonNull(field: string, value: any, multiple?: string): void {`);
            w.tab(1).writeln(`return errorHelper(field, value, multiple ?? "non-nullable object");`);
            w.writeln(`}`);
        }
        if (s.has('throwNotObject')) {
            this.markHelperAsUsed("errorHelper");
            if (process.argv.includes('-debug'))
                w.writeln(`function throwNotObject(field: string, value: any, multiple?: string): never {`);
            else
                w.writeln(`function throwNotObject(field: string, value: any, multiple?: string): void {`);
            w.tab(1).writeln(`return errorHelper(field, value, multiple ?? "object");`);
            w.writeln(`}`);
        }
        if (s.has('throwIsArray')) {
            this.markHelperAsUsed("errorHelper");
            if (process.argv.includes('-debug'))
                w.writeln(`function throwIsArray(field: string, value: any, multiple?: string): never {`);
            else
                w.writeln(`function throwIsArray(field: string, value: any, multiple?: string): void {`);
            w.tab(1).writeln(`return errorHelper(field, value, multiple ?? "object");`);
            w.writeln(`}`);
        }
        if (s.has('checkArray')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkArray(value: any, field: string, multiple?: string): void {`);
            w.tab(1).writeln(`if (!Array.isArray(value)) errorHelper(field, value, multiple ?? "array");`);
            w.writeln(`}`);
        }
        if (s.has('checkNumber')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkNumber(value: any, field: string, multiple?: string): void {`);
            w.tab(1).writeln(`if (typeof(value) !== 'number') errorHelper(field, value, multiple ?? "number");`);
            w.writeln(`}`);
        }
        if (s.has('checkBoolean')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkBoolean(value: any, field: string, multiple?: string): void {`);
            w.tab(1).writeln(`if (typeof(value) !== 'boolean') errorHelper(field, value, multiple ?? "boolean");`);
            w.writeln(`}`);
        }
        if (s.has('checkString')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkString(value: any, field: string, multiple?: string): void {`);
            w.tab(1).writeln(`if (typeof(value) !== 'string') errorHelper(field, value, multiple ?? "string");`);
            w.writeln(`}`);
        }
        if (s.has('checkNull')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkNull(value: any, field: string, multiple?: string): void {`);
            w.tab(1).writeln(`if (value !== null) errorHelper(field, value, multiple ?? "null");`);
            w.writeln(`}`);
        }
        if (s.has('checkNever')) {
            this.markHelperAsUsed("errorHelper");
            if (process.argv.includes('-debug'))
                w.writeln(`function checkNever(value: any, field: string, multiple?: string): never {`);
            else
                w.writeln(`function checkNever(value: any, field: string, multiple?: string): void {`);
            w.tab(1).writeln(`return errorHelper(field, value, multiple ?? "never");`);
            w.writeln(`}`);
        }
        if (s.has('errorHelper')) {
            if (process.argv.includes('-debug'))
                w.writeln(`function errorHelper(field: string, d: any, type: string): never {`);
            else
                w.writeln(`function errorHelper(field: string, d: any, type: string): void {`);
            w.tab(1).writeln(`if (type.includes(' | ')) {`);
            w.tab(2).writeln(`throw new TypeError('Expected ' + type + " at " + field + " but found:\\n" + JSON.stringify(d) + "\\n\\nFull object:\\n" + JSON.stringify(obj));`);
            w.tab(1).writeln(`} else {`);
            w.tab(2).writeln(`let jsonClone = obj;`);
            w.tab(2).writeln(`try {`);
            w.tab(3).writeln(`jsonClone = JSON.parse(JSON.stringify(obj));`);
            w.tab(2).writeln(`} catch(error) {`);
            w.tab(3).writeln(`console.log(error);`);
            w.tab(2).writeln(`}`);
            w.tab(2).writeln(`console.error('Expected "' + type + '" at ' + field + ' but found:\\n' + JSON.stringify(d), jsonClone);`);
            if (!process.argv.includes('-prod')) {
                w.tab(2).writeln(`prompt(proxyName+':', JSON.stringify(obj));`);
            }
            w.tab(1).writeln(`}`);
            if (process.argv.includes('-debug'))
                w.tab(1).writeln(`throw new TypeError('Expected ' + type + " at " + field + " but found:\\n" + JSON.stringify(d) + "\\n\\nFull object:\\n" + JSON.stringify(obj));`);
            w.writeln(`}`);
        }
    }
    /**
     * Registers the provided shape with the emitter. If an equivalent shape
     * already exists, then the emitter returns the equivalent shape.
     */
    registerRecordShape(s) {
        const rv = this._records.filter((r) => r.equal(s));
        if (rv.length === 0) {
            this._records.push(s);
            return s;
        }
        else {
            return rv[0];
        }
    }
    /**
     * Registers the provided shape name with the emitter. If another
     * shape has already claimed this name, it returns a similar unique
     * name that should be used instead.
     */
    registerName(name) {
        if (!this._claimedNames.has(name)) {
            this._claimedNames.add(name);
            return name;
        }
        else {
            let baseName = name;
            let i = 1;
            do {
                name = `${baseName}${i}`;
                i++;
            } while (this._claimedNames.has(name));
            this._claimedNames.add(name);
            return name;
        }
    }
}
