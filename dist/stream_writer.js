import Writer from './writer.js';
/**
 * Writes output to a stream.
 */
export default class StreamWriter extends Writer {
    stream;
    constructor(stream) {
        super();
        this.stream = stream;
    }
    write(s) {
        this.stream.write(new Buffer(s, 'utf8'));
        return this;
    }
    close(cb) {
        this.stream.end();
        setTimeout(cb, 4);
    }
}
