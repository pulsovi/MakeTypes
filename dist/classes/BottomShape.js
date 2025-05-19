import { Shape } from "./Shape.js";
export class BottomShape extends Shape {
    get type() {
        return 0 /* BaseShape.BOTTOM */;
    }
    emitType(e) {
        throw new Error(`Doesn't make sense.`);
    }
    getProxyType(e) {
        throw new Error(`Doesn't make sense.`);
    }
    emitProxyTypeCheck() {
        throw new TypeError('Impossible: Bottom should never appear in a type.');
    }
}
export const bottomShape = new BottomShape();
