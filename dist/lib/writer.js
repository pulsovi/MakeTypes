"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = Writer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3dyaXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQWUsTUFBTTtJQUNGLElBQUksQ0FBUztJQUNiLEdBQUcsQ0FBUztJQUM3QixZQUFhLE1BQWMsSUFBSSxFQUFFLE9BQU8sR0FBRyxJQUFJO1FBQzdDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDO0lBQ3JCLENBQUM7SUFHRCxjQUFjO0lBQ1AsR0FBRyxDQUFDLENBQVM7UUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxvQkFBb0I7SUFDYixJQUFJO1FBQ1QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBQ00sT0FBTyxDQUFDLENBQVM7UUFDdEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzlCLENBQUM7Q0FDRjtBQUNELGtCQUFlLE1BQU0sQ0FBQyJ9