import { CollectionShape } from "./CollectionShape.js";
import Context, { ContextType } from "./Context.js";
import Emitter from "./Emitter.js";

export class EntityContext extends Context {
  public get type(): ContextType.ENTITY {
    return ContextType.ENTITY;
  }
  public readonly parent: CollectionShape;
  constructor(parent: CollectionShape) {
    super();
    this.parent = parent;
  }
  public getName(e: Emitter): string {
    return `${this.parent.getName(e)}Entity`;
  }
}
