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
 * Calls callbacks when written to.
 */
var CallbackWriter = /** @class */ (function (_super) {
    __extends(CallbackWriter, _super);
    function CallbackWriter(writeCb, endCb) {
        var _this = _super.call(this) || this;
        _this._writeCb = writeCb;
        _this._endCb = endCb;
        return _this;
    }
    CallbackWriter.prototype.write = function (s) {
        this._writeCb(s);
        return this;
    };
    CallbackWriter.prototype.close = function (cb) {
        this._endCb();
        setTimeout(cb, 4);
    };
    return CallbackWriter;
}(Writer));
export default CallbackWriter;
