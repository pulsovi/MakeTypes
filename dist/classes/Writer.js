class Writer {
    _tab;
    _nl;
    constructor(tab = "  ", newline = "\n") {
        this._tab = tab;
        this._nl = newline;
    }
    // Tab n times
    tab(n) {
        for (let i = 0; i < n; i++) {
            this.write(this._tab);
        }
        return this;
    }
    // End current line.
    endl() {
        return this.write(this._nl);
    }
    writeln(s) {
        return this.write(s).endl();
    }
}
export default Writer;
