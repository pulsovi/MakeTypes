import { RecordShape } from "./RecordShape.js";
import Writer from "./Writer.js";
export default class Emitter {
    private _records;
    private _claimedNames;
    readonly interfaces: Writer;
    readonly proxies: Writer;
    private _helpersToEmit;
    /**
     * if true `Proxy` string will be added at the end of proxies name
     */
    postfixProxy: boolean;
    typeOfObject: 'interface' | 'type';
    constructor(interfaces: Writer, proxies: Writer, options?: {
        typeOfObject?: 'interface' | 'type';
        postfixProxy?: boolean;
    });
    markHelperAsUsed(n: string): void;
    emit(root: any, rootName: string): void;
    private _emitRootRecordShape;
    private _emitProxyHelpers;
    /**
     * Registers the provided shape with the emitter. If an equivalent shape
     * already exists, then the emitter returns the equivalent shape.
     */
    registerRecordShape(s: RecordShape): RecordShape;
    /**
     * Registers the provided shape name with the emitter. If another
     * shape has already claimed this name, it returns a similar unique
     * name that should be used instead.
     */
    registerName(name: string): string;
}
