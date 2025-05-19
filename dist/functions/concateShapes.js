import { AnyShape } from "../classes/AnyShape.js";
import { BottomShape } from "../classes/BottomShape.js";
import { CollectionShape } from "../classes/CollectionShape.js";
import { NeverShape } from "../classes/NeverShape.js";
import { RecordShape } from "../classes/RecordShape.js";
Error.stackTraceLimit = 200;
export function concateShapes(e, s1, s2) {
    if (new Error('').stack.split('\n').length > 90)
        debugger;
    // concateShapes(⊥, σ) = concateShapes(σ, ⊥) = σ
    if (s1 instanceof BottomShape) {
        return s2;
    }
    if (s2 instanceof BottomShape) {
        return s1;
    }
    // concateShapes(never, σ) = concateShapes(σ, never) = optional<σ>
    if (s1 instanceof NeverShape) {
        return s2.makeOptional();
    }
    if (s2 instanceof NeverShape) {
        return s1.makeOptional();
    }
    // concateShapes(any, σ) = concateShapes(σ, any) = any
    if (s1 instanceof AnyShape) {
        return s1.addToShapes(s2);
    }
    if (s2 instanceof AnyShape) {
        return s2.addToShapes(s1);
    }
    // concateShapes(σ2, optional<σˆ1> ) = concateShapes(optional<σˆ1> , σ2) = optional<concateShapes(σˆ1, σ2)>
    if (s1.optional) {
        return concateShapes(e, s1.makeNonOptional(), s2).makeOptional();
    }
    if (s2.optional) {
        return concateShapes(e, s2.makeNonOptional(), s1).makeOptional();
    }
    // concateShapes(σ, σ) = σ
    if (s1 === s2 || s1.equal(s2)) {
        return s1.clone({
            samples: s1.samples.concat(s2.samples),
            optional: s1.optional || s2.optional,
        });
    }
    // concateShapes([σ1], [σ2]) = [concateShapes(σ1, σ2)]
    if (s1 instanceof CollectionShape && s2 instanceof CollectionShape) {
        return new CollectionShape({
            baseShape: concateShapes(e, s1.baseShape, s2.baseShape),
            optional: s1.optional || s2.optional,
            contexts: s1.contexts.concat(s2.contexts),
            samples: s1.samples.concat(s2.samples)
        });
    }
    // (recd) rule
    if (s1 instanceof RecordShape && s2 instanceof RecordShape) {
        // Get all fields.
        const fields = new Map();
        s1.forEachField((t, name) => { fields.set(name, concateShapes(e, t, s2.getField(name))); });
        s2.forEachField((t, name) => { if (!fields.has(name))
            fields.set(name, t.makeOptional()); });
        return RecordShape.Create(e, {
            fields,
            optional: s1.optional || s2.optional,
            samples: s1.samples.concat(s2.samples),
            contexts: s1.contexts.concat(s2.contexts),
        });
    }
    // (any) rule
    return new AnyShape({
        shapes: [s1, s2],
        samples: [...s1.samples, ...s2.samples],
        optional: s1.optional || s2.optional
    });
}
