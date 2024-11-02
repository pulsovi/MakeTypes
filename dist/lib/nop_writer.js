"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const writer_1 = __importDefault(require("./writer"));
/**
 * Does nothing.
 */
class NopWriter extends writer_1.default {
    write(s) {
        return this;
    }
    close(cb) {
        setTimeout(cb, 4);
    }
}
exports.default = NopWriter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9wX3dyaXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9ub3Bfd3JpdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQThCO0FBRTlCOztHQUVHO0FBQ0gsTUFBcUIsU0FBVSxTQUFRLGdCQUFNO0lBQ3BDLEtBQUssQ0FBQyxDQUFTO1FBQ3BCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNNLEtBQUssQ0FBQyxFQUFjO1FBQ3pCLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDcEIsQ0FBQztDQUNGO0FBUEQsNEJBT0MifQ==