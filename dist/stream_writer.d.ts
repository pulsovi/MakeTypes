import Writer from './writer.js';
/**
 * Writes output to a stream.
 */
export default class StreamWriter extends Writer {
    readonly stream: NodeJS.WritableStream;
    constructor(stream: NodeJS.WritableStream);
    write(s: string): this;
    close(cb: () => void): void;
}
