import Writer from './Writer.js';
/**
 * Calls callbacks when written to.
 */
export default class CallbackWriter extends Writer {
    _writeCb;
    _endCb;
    constructor(writeCb, endCb) {
        super();
        this._writeCb = writeCb;
        this._endCb = endCb;
    }
    write(s) {
        this._writeCb(s);
        return this;
    }
    close(cb) {
        this._endCb();
        setTimeout(cb, 4);
    }
}
