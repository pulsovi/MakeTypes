"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitProxyTypeCheck = emitProxyTypeCheck;
const types_1 = require("./types");
function emitProxyTypeCheck(e, w, t, tabLevel, dataVar, fieldName) {
    switch (t.type) {
        case 7 /* BaseShape.ANY */:
            // TODO: This is terrible.
            const distilledShapes = t.getDistilledShapes(e);
            w.tab(tabLevel).writeln(`// This will be refactored in the next release.`);
            distilledShapes.forEach((s, i) => {
                w.tab(tabLevel + i).writeln(`try {`);
                emitProxyTypeCheck(e, w, s, tabLevel + i + 1, dataVar, fieldName);
                w.tab(tabLevel + i).writeln(`} catch (e) {`);
                if (i === distilledShapes.length - 1) {
                    w.tab(tabLevel + i + 1).writeln(`throw e;`);
                }
            });
            for (let i = 0; i < distilledShapes.length; i++) {
                w.tab(tabLevel + (distilledShapes.length - i - 1)).writeln(`}`);
            }
            break;
        case 4 /* BaseShape.BOOLEAN */:
            e.markHelperAsUsed('checkBoolean');
            w.tab(tabLevel).writeln(`checkBoolean(${dataVar}, ${t.nullable}, ${fieldName});`);
            break;
        case 0 /* BaseShape.BOTTOM */:
            throw new TypeError('Impossible: Bottom should never appear in a type.');
        case 6 /* BaseShape.COLLECTION */:
            e.markHelperAsUsed('checkArray');
            w.tab(tabLevel).writeln(`checkArray(${dataVar}, ${fieldName});`);
            w.tab(tabLevel).writeln(`if (${dataVar}) {`);
            // Now, we check each element.
            w.tab(tabLevel + 1).writeln(`for (let i = 0; i < ${dataVar}.length; i++) {`);
            emitProxyTypeCheck(e, w, t.baseShape, tabLevel + 2, `${dataVar}[i]`, `${fieldName} + "[" + i + "]"`);
            w.tab(tabLevel + 1).writeln(`}`);
            w.tab(tabLevel).writeln(`}`);
            break;
        case 1 /* BaseShape.NULL */:
            e.markHelperAsUsed('checkNull');
            w.tab(tabLevel).writeln(`checkNull(${dataVar}, ${fieldName});`);
            break;
        case 5 /* BaseShape.NUMBER */:
            e.markHelperAsUsed('checkNumber');
            w.tab(tabLevel).writeln(`checkNumber(${dataVar}, ${t.nullable}, ${fieldName});`);
            break;
        case 2 /* BaseShape.RECORD */:
            // Convert into a proxy.
            w.tab(tabLevel).writeln(`${dataVar} = ${t.getProxyClass(e)}.Create(${dataVar}, ${fieldName});`);
            break;
        case 3 /* BaseShape.STRING */:
            e.markHelperAsUsed('checkString');
            w.tab(tabLevel).writeln(`checkString(${dataVar}, ${t.nullable}, ${fieldName});`);
            break;
    }
    // Standardize undefined into null.
    if (t.nullable) {
        w.tab(tabLevel).writeln(`if (${dataVar} === undefined) {`);
        w.tab(tabLevel + 1).writeln(`${dataVar} = null;`);
        w.tab(tabLevel).writeln(`}`);
    }
}
class Emitter {
    _records = [];
    _claimedNames = new Set();
    interfaces;
    proxies;
    _helpersToEmit = new Set();
    // The type of object being emitted.
    // some prefer interfaces, some prefer types.
    typeOfObject = 'interface';
    constructor(interfaces, proxies, typeOfObject) {
        this.interfaces = interfaces;
        this.proxies = proxies;
        this.typeOfObject = typeOfObject || 'interface';
    }
    markHelperAsUsed(n) {
        this._helpersToEmit.add(n);
    }
    emit(root, rootName) {
        let rootShape = (0, types_1.d2s)(this, root);
        if (rootShape.type === 6 /* BaseShape.COLLECTION */) {
            rootShape = rootShape.baseShape;
        }
        this.proxies.writeln(`// Stores the currently-being-typechecked object for error messages.`);
        this.proxies.writeln(`let obj: any = null;`);
        if (rootShape.type !== 2 /* BaseShape.RECORD */) {
            this._claimedNames.add(rootName);
            const roots = new Set();
            (0, types_1.getReferencedRecordShapes)(this, roots, rootShape);
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
            this.proxies.writeln(`export class ${rootName}Proxy {`);
            this.proxies.tab(1).writeln(`public static Parse(s: string): ${rootShape.getProxyType(this)} {`);
            this.proxies.tab(2).writeln(`return ${rootName}Proxy.Create(JSON.parse(s));`);
            this.proxies.tab(1).writeln(`}`);
            this.proxies.tab(1).writeln(`public static Create(s: any, fieldName?: string): ${rootShape.getProxyType(this)} {`);
            this.proxies.tab(2).writeln(`if (!fieldName) {`);
            this.proxies.tab(3).writeln(`obj = s;`);
            this.proxies.tab(3).writeln(`fieldName = "root";`);
            this.proxies.tab(2).writeln(`}`);
            emitProxyTypeCheck(this, this.proxies, rootShape, 2, 's', "fieldName");
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
            w.writeln(`function throwNull2NonNull(field: string, d: any): never {`);
            w.tab(1).writeln(`return errorHelper(field, d, "non-nullable object", false);`);
            w.writeln(`}`);
        }
        if (s.has('throwNotObject')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function throwNotObject(field: string, d: any, nullable: boolean): never {`);
            w.tab(1).writeln(`return errorHelper(field, d, "object", nullable);`);
            w.writeln(`}`);
        }
        if (s.has('throwIsArray')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function throwIsArray(field: string, d: any, nullable: boolean): never {`);
            w.tab(1).writeln(`return errorHelper(field, d, "object", nullable);`);
            w.writeln(`}`);
        }
        if (s.has('checkArray')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkArray(d: any, field: string): void {`);
            w.tab(1).writeln(`if (!Array.isArray(d) && d !== null && d !== undefined) {`);
            w.tab(2).writeln(`errorHelper(field, d, "array", true);`);
            w.tab(1).writeln(`}`);
            w.writeln(`}`);
        }
        if (s.has('checkNumber')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkNumber(d: any, nullable: boolean, field: string): void {`);
            w.tab(1).writeln(`if (typeof(d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {`);
            w.tab(2).writeln(`errorHelper(field, d, "number", nullable);`);
            w.tab(1).writeln(`}`);
            w.writeln(`}`);
        }
        if (s.has('checkBoolean')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkBoolean(d: any, nullable: boolean, field: string): void {`);
            w.tab(1).writeln(`if (typeof(d) !== 'boolean' && (!nullable || (nullable && d !== null && d !== undefined))) {`);
            w.tab(2).writeln(`errorHelper(field, d, "boolean", nullable);`);
            w.tab(1).writeln(`}`);
            w.writeln(`}`);
        }
        if (s.has('checkString')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkString(d: any, nullable: boolean, field: string): void {`);
            w.tab(1).writeln(`if (typeof(d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {`);
            w.tab(2).writeln(`errorHelper(field, d, "string", nullable);`);
            w.tab(1).writeln(`}`);
            w.writeln(`}`);
        }
        if (s.has('checkNull')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln(`function checkNull(d: any, field: string): void {`);
            w.tab(1).writeln(`if (d !== null && d !== undefined) {`);
            w.tab(2).writeln(`errorHelper(field, d, "null or undefined", false);`);
            w.tab(1).writeln(`}`);
            w.writeln(`}`);
        }
        if (s.has('errorHelper')) {
            w.writeln(`function errorHelper(field: string, d: any, type: string, nullable: boolean): never {`);
            w.tab(1).writeln(`if (nullable) {`);
            w.tab(2).writeln(`type += ", null, or undefined";`);
            w.tab(1).writeln(`}`);
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
exports.default = Emitter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9lbWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsZ0RBeURDO0FBM0RELG1DQUF1RjtBQUV2RixTQUFnQixrQkFBa0IsQ0FBQyxDQUFVLEVBQUUsQ0FBUyxFQUFFLENBQVEsRUFBRSxRQUFnQixFQUFFLE9BQWUsRUFBRSxTQUFpQjtJQUN0SCxRQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQjtZQUNFLDBCQUEwQjtZQUMxQixNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsaURBQWlELENBQUMsQ0FBQztZQUMzRSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMvQixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDbEUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsS0FBSyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNyQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxLQUFLLElBQUksQ0FBQyxH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