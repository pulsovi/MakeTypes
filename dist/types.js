import { emitProxyTypeCheck } from './emit';
// Add any more invalid charachaters here 
var invalidChars = /[0-9-+\*\/\?: ]/g;
function safeField(field) {
    return field.match(invalidChars)
        ? "\"".concat(field, "\"")
        : field;
}
function safeInterfaceName(name) {
    return name.match(invalidChars) ? name.replace(invalidChars, "_") : name;
}
function safeObjectField(objectName, field) {
    return field.match(invalidChars)
        ? "".concat(objectName, "[\"").concat(field, "\"]")
        : "".concat(objectName, ".").concat(field);
}
function pascalCase(n) {
    return n.split("_").map(function (s) { return (s[0] ? s[0].toUpperCase() : "") + s.slice(1); }).join("");
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
            sh.getDistilledShapes(e).forEach(function (sh) { return getReferencedRecordShapes(e, s, sh); });
            break;
    }
}
var FieldContext = /** @class */ (function () {
    function FieldContext(parent, field) {
        this.parent = parent;
        this.field = field;
    }
    Object.defineProperty(FieldContext.prototype, "type", {
        get: function () {
            return 1 /* ContextType.FIELD */;
        },
        enumerable: false,
        configurable: true
    });
    FieldContext.prototype.getName = function (e) {
        var name = pascalCase(this.field);
        return name;
    };
    return FieldContext;
}());
export { FieldContext };
var EntityContext = /** @class */ (function () {
    function EntityContext(parent) {
        this.parent = parent;
    }
    Object.defineProperty(EntityContext.prototype, "type", {
        get: function () {
            return 0 /* ContextType.ENTITY */;
        },
        enumerable: false,
        configurable: true
    });
    EntityContext.prototype.getName = function (e) {
        return "".concat(this.parent.getName(e), "Entity");
    };
    return EntityContext;
}());
export { EntityContext };
var CBottomShape = /** @class */ (function () {
    function CBottomShape() {
    }
    Object.defineProperty(CBottomShape.prototype, "type", {
        get: function () {
            return 0 /* BaseShape.BOTTOM */;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CBottomShape.prototype, "nullable", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    CBottomShape.prototype.makeNullable = function () {
        throw new TypeError("Doesn't make sense.");
    };
    CBottomShape.prototype.makeNonNullable = function () {
        return this;
    };
    CBottomShape.prototype.emitType = function (e) {
        throw new Error("Doesn't make sense.");
    };
    CBottomShape.prototype.getProxyType = function (e) {
        throw new Error("Doesn't make sense.");
    };
    CBottomShape.prototype.equal = function (t) {
        return this === t;
    };
    return CBottomShape;
}());
export { CBottomShape };
export var BottomShape = new CBottomShape();
var CNullShape = /** @class */ (function () {
    function CNullShape() {
    }
    Object.defineProperty(CNullShape.prototype, "nullable", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CNullShape.prototype, "type", {
        get: function () {
            return 1 /* BaseShape.NULL */;
        },
        enumerable: false,
        configurable: true
    });
    CNullShape.prototype.makeNullable = function () {
        return this;
    };
    CNullShape.prototype.makeNonNullable = function () {
        return this;
    };
    CNullShape.prototype.emitType = function (e) {
        e.interfaces.write("null");
    };
    CNullShape.prototype.getProxyType = function (e) {
        return "null";
    };
    CNullShape.prototype.equal = function (t) {
        return this === t;
    };
    return CNullShape;
}());
export { CNullShape };
export var NullShape = new CNullShape();
var CNumberShape = /** @class */ (function () {
    function CNumberShape() {
    }
    Object.defineProperty(CNumberShape.prototype, "nullable", {
        get: function () {
            return this === NullableNumberShape;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CNumberShape.prototype, "type", {
        get: function () {
            return 5 /* BaseShape.NUMBER */;
        },
        enumerable: false,
        configurable: true
    });
    CNumberShape.prototype.makeNullable = function () {
        return NullableNumberShape;
    };
    CNumberShape.prototype.makeNonNullable = function () {
        return NumberShape;
    };
    CNumberShape.prototype.emitType = function (e) {
        e.interfaces.write(this.getProxyType(e));
    };
    CNumberShape.prototype.getProxyType = function (e) {
        var rv = "number";
        if (this.nullable) {
            rv += " | null";
        }
        return rv;
    };
    CNumberShape.prototype.equal = function (t) {
        return this === t;
    };
    return CNumberShape;
}());
export { CNumberShape };
export var NumberShape = new CNumberShape();
export var NullableNumberShape = new CNumberShape();
var CStringShape = /** @class */ (function () {
    function CStringShape() {
    }
    Object.defineProperty(CStringShape.prototype, "type", {
        get: function () {
            return 3 /* BaseShape.STRING */;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CStringShape.prototype, "nullable", {
        get: function () {
            return this === NullableStringShape;
        },
        enumerable: false,
        configurable: true
    });
    CStringShape.prototype.makeNullable = function () {
        return NullableStringShape;
    };
    CStringShape.prototype.makeNonNullable = function () {
        return StringShape;
    };
    CStringShape.prototype.emitType = function (e) {
        e.interfaces.write(this.getProxyType(e));
    };
    CStringShape.prototype.getProxyType = function (e) {
        var rv = "string";
        if (this.nullable) {
            rv += " | null";
        }
        return rv;
    };
    CStringShape.prototype.equal = function (t) {
        return this === t;
    };
    return CStringShape;
}());
export { CStringShape };
export var StringShape = new CStringShape();
export var NullableStringShape = new CStringShape();
var CBooleanShape = /** @class */ (function () {
    function CBooleanShape() {
    }
    Object.defineProperty(CBooleanShape.prototype, "type", {
        get: function () {
            return 4 /* BaseShape.BOOLEAN */;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CBooleanShape.prototype, "nullable", {
        get: function () {
            return this === NullableBooleanShape;
        },
        enumerable: false,
        configurable: true
    });
    CBooleanShape.prototype.makeNullable = function () {
        return NullableBooleanShape;
    };
    CBooleanShape.prototype.makeNonNullable = function () {
        return BooleanShape;
    };
    CBooleanShape.prototype.emitType = function (e) {
        e.interfaces.write(this.getProxyType(e));
    };
    CBooleanShape.prototype.getProxyType = function (e) {
        var rv = "boolean";
        if (this.nullable) {
            rv += " | null";
        }
        return rv;
    };
    CBooleanShape.prototype.equal = function (t) {
        return this === t;
    };
    return CBooleanShape;
}());
export { CBooleanShape };
export var BooleanShape = new CBooleanShape();
export var NullableBooleanShape = new CBooleanShape();
var CAnyShape = /** @class */ (function () {
    function CAnyShape(shapes, nullable) {
        this._nullable = false;
        this._hasDistilledShapes = false;
        this._distilledShapes = [];
        this._shapes = shapes;
        this._nullable = nullable;
    }
    Object.defineProperty(CAnyShape.prototype, "type", {
        get: function () {
            return 7 /* BaseShape.ANY */;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CAnyShape.prototype, "nullable", {
        get: function () {
            return this._nullable === true;
        },
        enumerable: false,
        configurable: true
    });
    CAnyShape.prototype.makeNullable = function () {
        if (this._nullable) {
            return this;
        }
        else {
            return new CAnyShape(this._shapes, true);
        }
    };
    CAnyShape.prototype.makeNonNullable = function () {
        if (this._nullable) {
            return new CAnyShape(this._shapes, false);
        }
        else {
            return this;
        }
    };
    CAnyShape.prototype._ensureDistilled = function (e) {
        var _this = this;
        if (!this._hasDistilledShapes) {
            var shapes = new Map();
            for (var i = 0; i < this._shapes.length; i++) {
                var s = this._shapes[i];
                if (!shapes.has(s.type)) {
                    shapes.set(s.type, []);
                }
                shapes.get(s.type).push(s);
            }
            shapes.forEach(function (shapes, key) {
                var shape = BottomShape;
                for (var i = 0; i < shapes.length; i++) {
                    shape = csh(e, shape, shapes[i]);
                }
                _this._distilledShapes.push(shape);
            });
            this._hasDistilledShapes = true;
        }
    };
    CAnyShape.prototype.getDistilledShapes = function (e) {
        this._ensureDistilled(e);
        return this._distilledShapes;
    };
    CAnyShape.prototype.addToShapes = function (shape) {
        var shapeClone = this._shapes.slice(0);
        shapeClone.push(shape);
        return new CAnyShape(shapeClone, this._nullable);
    };
    CAnyShape.prototype.emitType = function (e) {
        var _this = this;
        this._ensureDistilled(e);
        this._distilledShapes.forEach(function (s, i) {
            s.emitType(e);
            if (i < _this._distilledShapes.length - 1) {
                e.interfaces.write(" | ");
            }
        });
    };
    CAnyShape.prototype.getProxyType = function (e) {
        this._ensureDistilled(e);
        return this._distilledShapes.map(function (s) { return s.getProxyType(e); }).join(" | ");
    };
    CAnyShape.prototype.equal = function (t) {
        return this === t;
    };
    return CAnyShape;
}());
export { CAnyShape };
var CRecordShape = /** @class */ (function () {
    function CRecordShape(fields, nullable, contexts) {
        var _this = this;
        this._name = null;
        // Assign a context to all fields.
        var fieldsWithContext = new Map();
        fields.forEach(function (val, index) {
            if (val.type === 2 /* BaseShape.RECORD */ || val.type === 6 /* BaseShape.COLLECTION */) {
                fieldsWithContext.set(index, val.addContext(new FieldContext(_this, index)));
            }
            else {
                fieldsWithContext.set(index, val);
            }
        });
        this._fields = fieldsWithContext;
        this._nullable = nullable;
        this.contexts = contexts;
    }
    Object.defineProperty(CRecordShape.prototype, "type", {
        get: function () {
            return 2 /* BaseShape.RECORD */;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CRecordShape.prototype, "nullable", {
        get: function () {
            return this._nullable;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Construct a new record shape. Returns an existing, equivalent record shape
     * if applicable.
     */
    CRecordShape.Create = function (e, fields, nullable, contexts) {
        if (contexts === void 0) { contexts = []; }
        var record = new CRecordShape(fields, nullable, contexts);
        return e.registerRecordShape(record);
    };
    CRecordShape.prototype.makeNullable = function () {
        if (this._nullable) {
            return this;
        }
        else {
            return new CRecordShape(this._fields, true, this.contexts);
        }
    };
    CRecordShape.prototype.addContext = function (ctx) {
        this.contexts.push(ctx);
        return this;
    };
    CRecordShape.prototype.makeNonNullable = function () {
        if (this._nullable) {
            return new CRecordShape(this._fields, false, this.contexts);
        }
        else {
            return this;
        }
    };
    CRecordShape.prototype.forEachField = function (cb) {
        this._fields.forEach(cb);
    };
    CRecordShape.prototype.getField = function (name) {
        var t = this._fields.get(name);
        if (!t) {
            return NullShape;
        }
        else {
            return t;
        }
    };
    CRecordShape.prototype.equal = function (t) {
        if (t.type === 2 /* BaseShape.RECORD */ && this._nullable === t._nullable && this._fields.size === t._fields.size) {
            var rv_1 = true;
            var tFields_1 = t._fields;
            // Check all fields.
            // NOTE: Since size is equal, no need to iterate over t. Either they have the same fields
            // or t is missing fields from this one.
            this.forEachField(function (t, name) {
                if (rv_1) {
                    var field = tFields_1.get(name);
                    if (field) {
                        rv_1 = field.equal(t);
                    }
                    else {
                        rv_1 = false;
                    }
                }
            });
            return rv_1;
        }
        return false;
    };
    CRecordShape.prototype.emitType = function (e) {
        e.interfaces.write(this.getName(e));
        if (this.nullable) {
            e.interfaces.write(" | null");
        }
    };
    CRecordShape.prototype.getProxyClass = function (e) {
        return "".concat(this.getName(e), "Proxy");
    };
    CRecordShape.prototype.getProxyType = function (e) {
        var rv = "".concat(this.getName(e), "Proxy");
        if (this.nullable) {
            rv += " | null";
        }
        return rv;
    };
    CRecordShape.prototype.emitInterfaceDefinition = function (e) {
        var w = e.interfaces;
        if (e.typeOfObject === 'type') {
            w.write("export type ".concat(this.getName(e), " = {")).endl();
        }
        else {
            w.write("export interface ".concat(this.getName(e), " {")).endl();
        }
        this.forEachField(function (t, name) {
            w.tab(1).write(safeField(name));
            if (t.nullable) {
                w.write("?");
            }
            w.write(": ");
            t.emitType(e);
            w.write(";").endl();
        });
        w.write("}");
    };
    CRecordShape.prototype.emitProxyClass = function (e) {
        var w = e.proxies;
        w.writeln("export class ".concat(this.getProxyClass(e), " {"));
        this.forEachField(function (t, name) {
            w.tab(1).writeln("public readonly ".concat(safeField(name), ": ").concat(t.getProxyType(e), ";"));
        });
        w.tab(1).writeln("public static Parse(d: string): ".concat(this.getProxyType(e), " {"));
        w.tab(2).writeln("return ".concat(this.getProxyClass(e), ".Create(JSON.parse(d));"));
        w.tab(1).writeln("}");
        w.tab(1).writeln("public static Create(d: any, field: string = 'root'): ".concat(this.getProxyType(e), " {"));
        w.tab(2).writeln("if (!field) {");
        w.tab(3).writeln("obj = d;");
        w.tab(3).writeln("field = \"root\";");
        w.tab(2).writeln("}");
        w.tab(2).writeln("if (d === null || d === undefined) {");
        w.tab(3);
        if (this.nullable) {
            w.writeln("return null;");
        }
        else {
            e.markHelperAsUsed('throwNull2NonNull');
            w.writeln("throwNull2NonNull(field, d);");
        }
        w.tab(2).writeln("} else if (typeof(d) !== 'object') {");
        e.markHelperAsUsed('throwNotObject');
        w.tab(3).writeln("throwNotObject(field, d, ".concat(this.nullable, ");"));
        w.tab(2).writeln("} else if (Array.isArray(d)) {");
        e.markHelperAsUsed('throwIsArray');
        w.tab(3).writeln("throwIsArray(field, d, ".concat(this.nullable, ");"));
        w.tab(2).writeln("}");
        // At this point, we know we have a non-null object.
        // Check all fields.
        this.forEachField(function (t, name) {
            emitProxyTypeCheck(e, w, t, 2, "".concat(safeObjectField('d', name)), "field + \".".concat(name, "\""));
        });
        w.tab(2).writeln("return new ".concat(this.getProxyClass(e), "(d);"));
        w.tab(1).writeln("}");
        w.tab(1).writeln("private constructor(d: any) {");
        // Emit an assignment for each field.
        this.forEachField(function (t, name) {
            w.tab(2).writeln("".concat(safeObjectField('this', name), " = ").concat(safeObjectField('d', name), ";"));
        });
        w.tab(1).writeln("}");
        w.writeln('}');
    };
    CRecordShape.prototype.getReferencedRecordShapes = function (e, rv) {
        this.forEachField(function (t, name) {
            getReferencedRecordShapes(e, rv, t);
        });
    };
    CRecordShape.prototype.markAsRoot = function (name) {
        this._name = name;
    };
    CRecordShape.prototype.getName = function (e) {
        if (typeof (this._name) === 'string') {
            return this._name;
        }
        // Calculate unique name.
        var nameSet = new Set();
        var name = this.contexts
            .map(function (c) { return c.getName(e); })
            // Remove duplicate names.
            .filter(function (n) {
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
    };
    return CRecordShape;
}());
export { CRecordShape };
var CCollectionShape = /** @class */ (function () {
    function CCollectionShape(baseShape, contexts) {
        if (contexts === void 0) { contexts = []; }
        this._name = null;
        // Add context if a record/collection.
        this.baseShape = (baseShape.type === 2 /* BaseShape.RECORD */ || baseShape.type === 6 /* BaseShape.COLLECTION */) ? baseShape.addContext(new EntityContext(this)) : baseShape;
        this.contexts = contexts;
    }
    Object.defineProperty(CCollectionShape.prototype, "type", {
        get: function () {
            return 6 /* BaseShape.COLLECTION */;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CCollectionShape.prototype, "nullable", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    CCollectionShape.prototype.makeNullable = function () {
        return this;
    };
    CCollectionShape.prototype.makeNonNullable = function () {
        return this;
    };
    CCollectionShape.prototype.addContext = function (ctx) {
        this.contexts.push(ctx);
        return this;
    };
    CCollectionShape.prototype.emitType = function (e) {
        e.interfaces.write("(");
        this.baseShape.emitType(e);
        e.interfaces.write(")[] | null");
    };
    CCollectionShape.prototype.getProxyType = function (e) {
        var base = this.baseShape.getProxyType(e);
        if (base.indexOf("|") !== -1) {
            return "(".concat(base, ")[] | null");
        }
        else {
            return "".concat(base, "[] | null");
        }
    };
    CCollectionShape.prototype.equal = function (t) {
        return t.type === 6 /* BaseShape.COLLECTION */ && this.baseShape.equal(t.baseShape);
    };
    CCollectionShape.prototype.getName = function (e) {
        if (typeof (this._name) === 'string') {
            return this._name;
        }
        var nameSet = new Set();
        // No need to make collection names unique.
        this._name = this.contexts
            .map(function (c) { return c.getName(e); })
            .filter(function (name) {
            if (!nameSet.has(name)) {
                nameSet.add(name);
                return true;
            }
            return false;
        })
            .join("Or");
        return this._name;
    };
    return CCollectionShape;
}());
export { CCollectionShape };
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
        var fields_1 = new Map();
        s1.forEachField(function (t, name) {
            fields_1.set(name, csh(e, t, s2.getField(name)));
        });
        s2.forEachField(function (t, name) {
            if (!fields_1.has(name)) {
                fields_1.set(name, csh(e, t, s1.getField(name)));
            }
        });
        return CRecordShape.Create(e, fields_1, false);
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
        var t = BottomShape;
        for (var i = 0; i < d.length; i++) {
            t = csh(e, t, d2s(e, d[i]));
        }
        return new CCollectionShape(t);
    }
    var keys = Object.keys(d);
    var fields = new Map();
    for (var i = 0; i < keys.length; i++) {
        var name_1 = keys[i];
        fields.set(name_1, d2s(e, d[name_1]));
    }
    return CRecordShape.Create(e, fields, false);
}
