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
        this.postfixProxy = options.postfixProxy ?? true;
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
            this.proxies.tab(1).writeln(`public static Create(s: any, fieldName?: string, type?: string, shouldThrow: boolean = true): ${rootShape.getProxyType(this)} {`);
            this.proxies.tab(2).writeln(`if (!fieldName) {`);
            this.proxies.tab(3).writeln(`obj = s;`);
            this.proxies.tab(3).writeln(`fieldName = "root";`);
            this.proxies.tab(2).writeln(`}`);
            rootShape.emitProxyTypeCheck({
                emitter: this,
                tabLevel: 2,
                dataVar: 's',
                fieldName: "fieldName",
                shouldThrow: 'shouldThrow',
                mode: { kind: 'createEarlyReturn', returnBinding: 's' },
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
            w.writeln(`function throwNull2NonNull(field: string, value: any, type: string): void {`);
            w.tab(1).writeln(`return errorHelper(field, value, type);`);
            w.writeln(`}`);
        }
        if (s.has('throwNotObject')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function throwNotObject(field: string, value: any, type: string): void {`);
            w.tab(1).writeln(`return errorHelper(field, value, type);`);
            w.writeln(`}`);
        }
        if (s.has('throwIsArray')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function throwIsArray(field: string, value: any, type: string): void {`);
            w.tab(1).writeln(`return errorHelper(field, value, type);`);
            w.writeln(`}`);
        }
        if (s.has('checkRecord')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkRecord(value: any, field: string, type: string, shouldThrow: boolean = true): boolean {`);
            w.tab(1).writeln(`if (typeof(value) === 'object' && value !== null && !Array.isArray(value)) return true;`);
            w.tab(1).writeln(`if (shouldThrow) errorHelper(field, value, type);`);
            w.tab(1).writeln(`return false;`);
            w.writeln(`}`);
        }
        if (s.has('checkArray')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkArray(value: any, field: string, type: string, shouldThrow: boolean = true): boolean {`);
            w.tab(1).writeln(`if (Array.isArray(value)) return true;`);
            w.tab(1).writeln(`if (shouldThrow) errorHelper(field, value, type);`);
            w.tab(1).writeln(`return false;`);
            w.writeln(`}`);
        }
        if (s.has('checkNumber')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkNumber(value: any, field: string, shouldThrow: boolean = true): boolean {`);
            w.tab(1).writeln(`if (typeof(value) === 'number') return true;`);
            w.tab(1).writeln(`if (shouldThrow) errorHelper(field, value, 'number');`);
            w.tab(1).writeln(`return false;`);
            w.writeln(`}`);
        }
        if (s.has('checkBoolean')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkBoolean(value: any, field: string, shouldThrow: boolean = true): boolean {`);
            w.tab(1).writeln(`if (typeof(value) === 'boolean') return true;`);
            w.tab(1).writeln(`if (shouldThrow) errorHelper(field, value, 'boolean');`);
            w.tab(1).writeln(`return false;`);
            w.writeln(`}`);
        }
        if (s.has('checkString')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkString(value: any, field: string, shouldThrow: boolean = true): boolean {`);
            w.tab(1).writeln(`if (typeof(value) === 'string') return true;`);
            w.tab(1).writeln(`if (shouldThrow) errorHelper(field, value, 'string');`);
            w.tab(1).writeln(`return false;`);
            w.writeln(`}`);
        }
        if (s.has('checkMulti')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkMulti(checkers: (() => boolean)[], value: any, field: string, type: string, shouldThrow: boolean = true): boolean {`);
            w.tab(1).writeln(`for (let i = 0; i < checkers.length; i++) {`);
            w.tab(2).writeln(`if (checkers[i]()) return true;`);
            w.tab(2).writeln(`}`);
            w.tab(1).writeln(`if (shouldThrow) errorHelper(field, value, type);`);
            w.tab(1).writeln(`return false;`);
            w.writeln(`}`);
        }
        if (s.has('checkNull')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkNull(value: any, field: string, shouldThrow: boolean = true): boolean {`);
            w.tab(1).writeln(`if (value === null) return true;`);
            w.tab(1).writeln(`if (shouldThrow) errorHelper(field, value, 'null');`);
            w.tab(1).writeln(`return false;`);
            w.writeln(`}`);
        }
        if (s.has('checkNever')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkNever(value: any, field: string, shouldThrow: boolean = true): boolean {`);
            w.tab(1).writeln(`if (shouldThrow) errorHelper(field, value, 'never');`);
            w.tab(1).writeln(`return false;`);
            w.writeln(`}`);
        }
        if (s.has('errorHelper')) {
            w.writeln(`function errorHelper(field: string, value: any, type: string): void {`);
            w.tab(1).writeln(`if (typeof globalThis.handleProxyError === 'function') {`);
            w.tab(2).writeln(`globalThis.handleProxyError(proxyName, obj, { path: field.split('.'), expectedType: type, actualValue: value });`);
            w.tab(1).writeln(`}`);
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
