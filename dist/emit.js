import { d2s, getReferencedRecordShapes } from './types';
export function emitProxyTypeCheck(e, w, t, tabLevel, dataVar, fieldName) {
    switch (t.type) {
        case 7 /* BaseShape.ANY */:
            // TODO: This is terrible.
            var distilledShapes_1 = t.getDistilledShapes(e);
            w.tab(tabLevel).writeln("// This will be refactored in the next release.");
            distilledShapes_1.forEach(function (s, i) {
                w.tab(tabLevel + i).writeln("try {");
                emitProxyTypeCheck(e, w, s, tabLevel + i + 1, dataVar, fieldName);
                w.tab(tabLevel + i).writeln("} catch (e) {");
                if (i === distilledShapes_1.length - 1) {
                    w.tab(tabLevel + i + 1).writeln("throw e;");
                }
            });
            for (var i = 0; i < distilledShapes_1.length; i++) {
                w.tab(tabLevel + (distilledShapes_1.length - i - 1)).writeln("}");
            }
            break;
        case 4 /* BaseShape.BOOLEAN */:
            e.markHelperAsUsed('checkBoolean');
            w.tab(tabLevel).writeln("checkBoolean(".concat(dataVar, ", ").concat(t.nullable, ", ").concat(fieldName, ");"));
            break;
        case 0 /* BaseShape.BOTTOM */:
            throw new TypeError('Impossible: Bottom should never appear in a type.');
        case 6 /* BaseShape.COLLECTION */:
            e.markHelperAsUsed('checkArray');
            w.tab(tabLevel).writeln("checkArray(".concat(dataVar, ", ").concat(fieldName, ");"));
            w.tab(tabLevel).writeln("if (".concat(dataVar, ") {"));
            // Now, we check each element.
            w.tab(tabLevel + 1).writeln("for (let i = 0; i < ".concat(dataVar, ".length; i++) {"));
            emitProxyTypeCheck(e, w, t.baseShape, tabLevel + 2, "".concat(dataVar, "[i]"), "".concat(fieldName, " + \"[\" + i + \"]\""));
            w.tab(tabLevel + 1).writeln("}");
            w.tab(tabLevel).writeln("}");
            break;
        case 1 /* BaseShape.NULL */:
            e.markHelperAsUsed('checkNull');
            w.tab(tabLevel).writeln("checkNull(".concat(dataVar, ", ").concat(fieldName, ");"));
            break;
        case 5 /* BaseShape.NUMBER */:
            e.markHelperAsUsed('checkNumber');
            w.tab(tabLevel).writeln("checkNumber(".concat(dataVar, ", ").concat(t.nullable, ", ").concat(fieldName, ");"));
            break;
        case 2 /* BaseShape.RECORD */:
            // Convert into a proxy.
            w.tab(tabLevel).writeln("".concat(dataVar, " = ").concat(t.getProxyClass(e), ".Create(").concat(dataVar, ", ").concat(fieldName, ");"));
            break;
        case 3 /* BaseShape.STRING */:
            e.markHelperAsUsed('checkString');
            w.tab(tabLevel).writeln("checkString(".concat(dataVar, ", ").concat(t.nullable, ", ").concat(fieldName, ");"));
            break;
    }
    // Standardize undefined into null.
    if (t.nullable) {
        w.tab(tabLevel).writeln("if (".concat(dataVar, " === undefined) {"));
        w.tab(tabLevel + 1).writeln("".concat(dataVar, " = null;"));
        w.tab(tabLevel).writeln("}");
    }
}
var Emitter = /** @class */ (function () {
    function Emitter(interfaces, proxies, typeOfObject) {
        this._records = [];
        this._claimedNames = new Set();
        this._helpersToEmit = new Set();
        // The type of object being emitted.
        // some prefer interfaces, some prefer types.
        this.typeOfObject = 'interface';
        this.interfaces = interfaces;
        this.proxies = proxies;
        this.typeOfObject = typeOfObject || 'interface';
    }
    Emitter.prototype.markHelperAsUsed = function (n) {
        this._helpersToEmit.add(n);
    };
    Emitter.prototype.emit = function (root, rootName) {
        var rootShape = d2s(this, root);
        if (rootShape.type === 6 /* BaseShape.COLLECTION */) {
            rootShape = rootShape.baseShape;
        }
        this.proxies.writeln("// Stores the currently-being-typechecked object for error messages.");
        this.proxies.writeln("let obj: any = null;");
        if (rootShape.type !== 2 /* BaseShape.RECORD */) {
            this._claimedNames.add(rootName);
            var roots = new Set();
            getReferencedRecordShapes(this, roots, rootShape);
            var rootArray_1 = new Array();
            roots.forEach(function (root) { return rootArray_1.push(root); });
            if (rootArray_1.length === 1) {
                this._emitRootRecordShape("".concat(rootName, "Entity"), rootArray_1[0]);
            }
            else {
                for (var i = 0; i < rootArray_1.length; i++) {
                    this._emitRootRecordShape("".concat(rootName, "Entity").concat(i), rootArray_1[i]);
                }
            }
            this.interfaces.write("export type ".concat(rootName, " = "));
            rootShape.emitType(this);
            this.interfaces.writeln(";").endl();
            this.proxies.writeln("export class ".concat(rootName, "Proxy {"));
            this.proxies.tab(1).writeln("public static Parse(s: string): ".concat(rootShape.getProxyType(this), " {"));
            this.proxies.tab(2).writeln("return ".concat(rootName, "Proxy.Create(JSON.parse(s));"));
            this.proxies.tab(1).writeln("}");
            this.proxies.tab(1).writeln("public static Create(s: any, fieldName?: string): ".concat(rootShape.getProxyType(this), " {"));
            this.proxies.tab(2).writeln("if (!fieldName) {");
            this.proxies.tab(3).writeln("obj = s;");
            this.proxies.tab(3).writeln("fieldName = \"root\";");
            this.proxies.tab(2).writeln("}");
            emitProxyTypeCheck(this, this.proxies, rootShape, 2, 's', "fieldName");
            this.proxies.tab(2).writeln("return s;");
            this.proxies.tab(1).writeln("}");
            this.proxies.writeln("}").endl();
        }
        else {
            this._emitRootRecordShape(rootName, rootShape);
        }
        this._emitProxyHelpers();
    };
    Emitter.prototype._emitRootRecordShape = function (name, rootShape) {
        var _this = this;
        this._claimedNames.add(name);
        rootShape.markAsRoot(name);
        rootShape.emitInterfaceDefinition(this);
        rootShape.emitProxyClass(this);
        this.interfaces.endl();
        this.proxies.endl();
        var set = new Set();
        rootShape.getReferencedRecordShapes(this, set);
        set.forEach(function (shape) {
            shape.emitInterfaceDefinition(_this);
            shape.emitProxyClass(_this);
            _this.interfaces.endl();
            _this.proxies.endl();
        });
    };
    Emitter.prototype._emitProxyHelpers = function () {
        var w = this.proxies;
        var s = this._helpersToEmit;
        if (s.has('throwNull2NonNull')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln("function throwNull2NonNull(field: string, d: any): never {");
            w.tab(1).writeln("return errorHelper(field, d, \"non-nullable object\", false);");
            w.writeln("}");
        }
        if (s.has('throwNotObject')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln("function throwNotObject(field: string, d: any, nullable: boolean): never {");
            w.tab(1).writeln("return errorHelper(field, d, \"object\", nullable);");
            w.writeln("}");
        }
        if (s.has('throwIsArray')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln("function throwIsArray(field: string, d: any, nullable: boolean): never {");
            w.tab(1).writeln("return errorHelper(field, d, \"object\", nullable);");
            w.writeln("}");
        }
        if (s.has('checkArray')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln("function checkArray(d: any, field: string): void {");
            w.tab(1).writeln("if (!Array.isArray(d) && d !== null && d !== undefined) {");
            w.tab(2).writeln("errorHelper(field, d, \"array\", true);");
            w.tab(1).writeln("}");
            w.writeln("}");
        }
        if (s.has('checkNumber')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln("function checkNumber(d: any, nullable: boolean, field: string): void {");
            w.tab(1).writeln("if (typeof(d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {");
            w.tab(2).writeln("errorHelper(field, d, \"number\", nullable);");
            w.tab(1).writeln("}");
            w.writeln("}");
        }
        if (s.has('checkBoolean')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln("function checkBoolean(d: any, nullable: boolean, field: string): void {");
            w.tab(1).writeln("if (typeof(d) !== 'boolean' && (!nullable || (nullable && d !== null && d !== undefined))) {");
            w.tab(2).writeln("errorHelper(field, d, \"boolean\", nullable);");
            w.tab(1).writeln("}");
            w.writeln("}");
        }
        if (s.has('checkString')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln("function checkString(d: any, nullable: boolean, field: string): void {");
            w.tab(1).writeln("if (typeof(d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {");
            w.tab(2).writeln("errorHelper(field, d, \"string\", nullable);");
            w.tab(1).writeln("}");
            w.writeln("}");
        }
        if (s.has('checkNull')) {
            this.markHelperAsUsed("errorHelper");
            w.writeln("function checkNull(d: any, field: string): void {");
            w.tab(1).writeln("if (d !== null && d !== undefined) {");
            w.tab(2).writeln("errorHelper(field, d, \"null or undefined\", false);");
            w.tab(1).writeln("}");
            w.writeln("}");
        }
        if (s.has('errorHelper')) {
            w.writeln("function errorHelper(field: string, d: any, type: string, nullable: boolean): never {");
            w.tab(1).writeln("if (nullable) {");
            w.tab(2).writeln("type += \", null, or undefined\";");
            w.tab(1).writeln("}");
            w.tab(1).writeln("throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n\" + JSON.stringify(d) + \"\\n\\nFull object:\\n\" + JSON.stringify(obj));");
            w.writeln("}");
        }
    };
    /**
     * Registers the provided shape with the emitter. If an equivalent shape
     * already exists, then the emitter returns the equivalent shape.
     */
    Emitter.prototype.registerRecordShape = function (s) {
        var rv = this._records.filter(function (r) { return r.equal(s); });
        if (rv.length === 0) {
            this._records.push(s);
            return s;
        }
        else {
            return rv[0];
        }
    };
    /**
     * Registers the provided shape name with the emitter. If another
     * shape has already claimed this name, it returns a similar unique
     * name that should be used instead.
     */
    Emitter.prototype.registerName = function (name) {
        if (!this._claimedNames.has(name)) {
            this._claimedNames.add(name);
            return name;
        }
        else {
            var baseName = name;
            var i = 1;
            do {
                name = "".concat(baseName).concat(i);
                i++;
            } while (this._claimedNames.has(name));
            this._claimedNames.add(name);
            return name;
        }
    };
    return Emitter;
}());
export default Emitter;
