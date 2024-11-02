"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const writer_1 = __importDefault(require("./writer"));
/**
 * Calls callbacks when written to.
 */
class CallbackWriter extends writer_1.default {
    _writeCb;
    _endCb;
    constructor(writeCb, endCb) {
        super();
        this._writeCb = writeCb;
        this._endCb = endCb;
    }
    write(s) {
        this._writeCb(s);
        return this;
    }
    close(cb) {
        this._endCb();
        setTimeout(cb, 4);
    }
}
exports.default = CallbackWriter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Jfd3JpdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NiX3dyaXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUE4QjtBQUU5Qjs7R0FFRztBQUNILE1BQXFCLGNBQWUsU0FBUSxnQkFBTTtJQUMvQixRQUFRLENBQXFCO0lBQzdCLE1BQU0sQ0FBWTtJQUNuQyxZQUFZLE9BQTJCLEVBQUUsS0FBZ0I7UUFDdkQsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBQ00sS0FBSyxDQUFDLENBQVM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDTSxLQUFLLENBQUMsRUFBYztRQUN6QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7Q0FDRjtBQWhCRCxpQ0FnQkMifQ==