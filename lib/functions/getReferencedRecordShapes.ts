import { AnyShape } from "../classes/AnyShape.js";
import { CollectionShape } from "../classes/CollectionShape.js";
import Emitter from "../classes/Emitter.js";
import { RecordShape } from "../classes/RecordShape.js";
import { Shape } from "../classes/Shape.js";

export function getReferencedRecordShapes(e: Emitter, s: Set<RecordShape>, sh: Shape): void {
  if (sh instanceof RecordShape) {
    if (!s.has(sh)) {
      s.add(sh);
      sh.getReferencedRecordShapes(e, s);
    }
  } else if (sh instanceof CollectionShape) {
    getReferencedRecordShapes(e, s, sh.baseShape);
  } else if (sh instanceof AnyShape) {
    sh.getDistilledShapes(e).forEach(
      (anyShapeItem) => getReferencedRecordShapes(e, s, anyShapeItem)
    );
  }
}
