import Emitter from "./Emitter.js";
export declare const enum ContextType {
    ENTITY = 0,
    FIELD = 1
}
export default abstract class Context {
    abstract getName(e: Emitter): string;
    abstract get type(): ContextType;
}
