import { pascalCase } from "../functions/pascalCase.js";
import Context from "./Context.js";
export class FieldContext extends Context {
    get type() {
        return 1 /* ContextType.FIELD */;
    }
    parent;
    field;
    constructor(parent, field) {
        super();
        this.parent = parent;
        this.field = field;
    }
    getName(e) {
        const name = pascalCase(this.field);
        return name;
    }
}
