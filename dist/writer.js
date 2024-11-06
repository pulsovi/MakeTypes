var Writer = /** @class */ (function () {
    function Writer(tab, newline) {
        if (tab === void 0) { tab = "  "; }
        if (newline === void 0) { newline = "\n"; }
        this._tab = tab;
        this._nl = newline;
    }
    // Tab n times
    Writer.prototype.tab = function (n) {
        for (var i = 0; i < n; i++) {
            this.write(this._tab);
        }
        return this;
    };
    // End current line.
    Writer.prototype.endl = function () {
        return this.write(this._nl);
    };
    Writer.prototype.writeln = function (s) {
        return this.write(s).endl();
    };
    return Writer;
}());
export default Writer;
