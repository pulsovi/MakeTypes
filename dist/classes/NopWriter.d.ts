import Writer from './Writer.js';
/**
 * Does nothing.
 */
export default class NopWriter extends Writer {
    write(s: string): this;
    close(cb: () => void): void;
}
