import Context from "./Context.js";
export class EntityContext extends Context {
    get type() {
        return 0 /* ContextType.ENTITY */;
    }
    parent;
    constructor(parent) {
        super();
        this.parent = parent;
    }
    getName(e) {
        return `${this.parent.getName(e)}Entity`;
    }
}
