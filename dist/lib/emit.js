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
    constructor(interfaces, proxies) {
        this.interfaces = interfaces;
        this.proxies = proxies;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9lbWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsZ0RBeURDO0FBM0RELG1DQUF1RjtBQUV2RixTQUFnQixrQkFBa0IsQ0FBQyxDQUFVLEVBQUUsQ0FBUyxFQUFFLENBQVEsRUFBRSxRQUFnQixFQUFFLE9BQWUsRUFBRSxTQUFpQjtJQUN0SCxRQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQjtZQUNFLDBCQUEwQjtZQUMxQixNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsaURBQWlELENBQUMsQ0FBQztZQUMzRSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMvQixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDbEUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsS0FBSyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNyQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNoRCxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFDRCxNQUFNO1FBQ1I7WUFDRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbkMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLE9BQU8sS0FBSyxDQUFDLENBQUMsUUFBUSxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUM7WUFDbEYsTUFBTTtRQUNSO1lBQ0UsTUFBTSxJQUFJLFNBQVMsQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1FBQzNFO1lBQ0UsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsT0FBTyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxPQUFPLEtBQUssQ0FBQyxDQUFBO1lBQzVDLDhCQUE4QjtZQUM5QixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLE9BQU8saUJBQWlCLENBQUMsQ0FBQTtZQUM1RSxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxHQUFHLE9BQU8sS0FBSyxFQUFFLEdBQUcsU0FBUyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3JHLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QixNQUFNO1FBQ1I7WUFDRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxPQUFPLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQztZQUNoRSxNQUFNO1FBQ1I7WUFDRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxPQUFPLEtBQUssQ0FBQyxDQUFDLFFBQVEsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDO1lBQ2pGLE1BQU07UUFDUjtZQUNFLHdCQUF3QjtZQUN4QixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLE9BQU8sTUFBTSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxXQUFXLE9BQU8sS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDO1lBQ2hHLE1BQU07UUFDUjtZQUNFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNsQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLE9BQU8sS0FBSyxDQUFDLENBQUMsUUFBUSxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUM7WUFDakYsTUFBTTtJQUNSLENBQUM7SUFDRCxtQ0FBbUM7SUFDbkMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDZixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLE9BQU8sbUJBQW1CLENBQUMsQ0FBQTtRQUMxRCxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxPQUFPLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7QUFDSCxDQUFDO0FBRUQsTUFBcUIsT0FBTztJQUNsQixRQUFRLEdBQW1CLEVBQUUsQ0FBQztJQUM5QixhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUMxQixVQUFVLENBQVM7SUFDbkIsT0FBTyxDQUFTO0lBQ3hCLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBQzNDLFlBQWEsVUFBa0IsRUFBRSxPQUFlO1FBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3pCLENBQUM7SUFDTSxnQkFBZ0IsQ0FBQyxDQUFTO1FBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFDTSxJQUFJLENBQUMsSUFBUyxFQUFFLFFBQWdCO1FBQ3JDLElBQUksU0FBUyxHQUFHLElBQUEsV0FBRyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLGlDQUF5QixFQUFFLENBQUM7WUFDNUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7UUFDbEMsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLHNFQUFzRSxDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUM3QyxJQUFJLFNBQVMsQ0FBQyxJQUFJLDZCQUFxQixFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakMsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWdCLENBQUM7WUFDdEMsSUFBQSxpQ0FBeUIsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELElBQUksU0FBUyxHQUFHLElBQUksS0FBSyxFQUFnQixDQUFDO1lBQzFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLFFBQVEsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9ELENBQUM7aUJBQU0sQ0FBQztnQkFDTixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUMxQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxRQUFRLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLENBQUM7WUFDSCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsZUFBZSxRQUFRLEtBQUssQ0FBQyxDQUFBO1lBQ25ELFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLFFBQVEsU0FBUyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxRQUFRLDhCQUE4QixDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxREFBcUQsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25DLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUNPLG9CQUFvQixDQUFDLElBQVksRUFBRSxTQUF1QjtRQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBZ0IsQ0FBQztRQUNwQyxTQUFTLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9DLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNwQixLQUFLLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ08saUJBQWlCO1FBQ3ZCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDdkIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUM5QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsT0FBTyxDQUFDLDREQUE0RCxDQUFDLENBQUE7WUFDdkUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsNkRBQTZELENBQUMsQ0FBQztZQUNoRixDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsT0FBTyxDQUFDLDRFQUE0RSxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsbURBQW1ELENBQUMsQ0FBQztZQUN0RSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLE9BQU8sQ0FBQywwRUFBMEUsQ0FBQyxDQUFDO1lBQ3RGLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7WUFDdEUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxPQUFPLENBQUMsb0RBQW9ELENBQUMsQ0FBQTtZQUMvRCxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQywyREFBMkQsQ0FBQyxDQUFDO1lBQzlFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7WUFDMUQsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxPQUFPLENBQUMsd0VBQXdFLENBQUMsQ0FBQTtZQUNuRixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw2RkFBNkYsQ0FBQyxDQUFDO1lBQ2hILENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxPQUFPLENBQUMseUVBQXlFLENBQUMsQ0FBQTtZQUNwRixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw4RkFBOEYsQ0FBQyxDQUFDO1lBQ2pILENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7WUFDaEUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxPQUFPLENBQUMsd0VBQXdFLENBQUMsQ0FBQTtZQUNuRixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw2RkFBNkYsQ0FBQyxDQUFDO1lBQ2hILENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxPQUFPLENBQUMsbURBQW1ELENBQUMsQ0FBQTtZQUM5RCxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQ3pELENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx1RkFBdUYsQ0FBQyxDQUFDO1lBQ25HLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7WUFDbkMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrSkFBa0osQ0FBQyxDQUFDO1lBQ3JLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsQ0FBQztJQUNILENBQUM7SUFDRDs7O09BR0c7SUFDSSxtQkFBbUIsQ0FBQyxDQUFlO1FBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsSUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxDQUFDO1FBQ1gsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNJLFlBQVksQ0FBQyxJQUFZO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsR0FBRyxDQUFDO2dCQUNGLElBQUksR0FBRyxHQUFHLFFBQVEsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDekIsQ0FBQyxFQUFFLENBQUM7WUFDTixDQUFDLFFBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBN0tELDBCQTZLQyJ9