import { CollectionShape } from "./CollectionShape.js";
import Context, { ContextType } from "./Context.js";
import Emitter from "./Emitter.js";
export declare class EntityContext extends Context {
    get type(): ContextType.ENTITY;
    readonly parent: CollectionShape;
    constructor(parent: CollectionShape);
    getName(e: Emitter): string;
}
