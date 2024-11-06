var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Writer from './writer';
/**
 * Writes output to a stream.
 */
var StreamWriter = /** @class */ (function (_super) {
    __extends(StreamWriter, _super);
    function StreamWriter(stream) {
        var _this = _super.call(this) || this;
        _this.stream = stream;
        return _this;
    }
    StreamWriter.prototype.write = function (s) {
        this.stream.write(new Buffer(s, 'utf8'));
        return this;
    };
    StreamWriter.prototype.close = function (cb) {
        this.stream.end();
        setTimeout(cb, 4);
    };
    return StreamWriter;
}(Writer));
export default StreamWriter;
