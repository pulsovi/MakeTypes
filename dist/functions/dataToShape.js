import { BooleanShape } from "../classes/BooleanShape.js";
import { bottomShape } from "../classes/BottomShape.js";
import { CollectionShape } from "../classes/CollectionShape.js";
import { NeverShape } from "../classes/NeverShape.js";
import { NullShape } from "../classes/NullShape.js";
import { NumberShape } from "../classes/NumberShape.js";
import { RecordShape } from "../classes/RecordShape.js";
import { StringShape } from "../classes/StringShape.js";
import { concateShapes } from "./concateShapes.js";
export function dataToShape(e, d) {
    // differentiation between null, undefined and optional
    if (d === null) {
        return new NullShape({ samples: [d] });
    }
    switch (typeof (d)) {
        case 'number':
            return new NumberShape({ samples: [d] });
        case 'string':
            return new StringShape({ samples: [d] });
        case 'boolean':
            return new BooleanShape({ samples: [d] });
    }
    // Must be an object or array.
    if (Array.isArray(d)) {
        // Empty array: Not enough information to figure out a precise type.
        if (d.length === 0) {
            return new CollectionShape({ baseShape: new NeverShape(), samples: [d] });
        }
        let t = bottomShape;
        for (let i = 0; i < d.length; i++) {
            t = concateShapes(e, t, dataToShape(e, d[i]));
        }
        return new CollectionShape({ baseShape: t, samples: [d] });
    }
    const keys = Object.keys(d);
    const fields = new Map();
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        fields.set(name, dataToShape(e, d[name]));
    }
    return RecordShape.Create(e, { fields, samples: [d] });
}
