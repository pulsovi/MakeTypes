import Emitter from "./Emitter.js";

export const enum ContextType {
  ENTITY,
  FIELD
}

export default abstract class Context {
  public abstract getName(e: Emitter): string;
  public abstract get type(): ContextType;
}
