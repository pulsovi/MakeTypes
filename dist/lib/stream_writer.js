"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const writer_1 = __importDefault(require("./writer"));
/**
 * Writes output to a stream.
 */
class StreamWriter extends writer_1.default {
    stream;
    constructor(stream) {
        super();
        this.stream = stream;
    }
    write(s) {
        this.stream.write(new Buffer(s, 'utf8'));
        return this;
    }
    close(cb) {
        this.stream.end();
        setTimeout(cb, 4);
    }
}
exports.default = StreamWriter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtX3dyaXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zdHJlYW1fd3JpdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQThCO0FBRTlCOztHQUVHO0FBQ0gsTUFBcUIsWUFBYSxTQUFRLGdCQUFNO0lBQzlCLE1BQU0sQ0FBd0I7SUFDOUMsWUFBWSxNQUE2QjtRQUN2QyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFDTSxLQUFLLENBQUMsQ0FBUztRQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN6QyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDTSxLQUFLLENBQUMsRUFBYztRQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDcEIsQ0FBQztDQUNGO0FBZEQsK0JBY0MifQ==