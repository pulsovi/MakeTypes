import Writer from './Writer.js';
/**
 * Does nothing.
 */
export default class NopWriter extends Writer {
    write(s) {
        return this;
    }
    close(cb) {
        setTimeout(cb, 4);
    }
}
