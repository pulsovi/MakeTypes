import Writer from './Writer.js';

/**
 * Does nothing.
 */
export default class NopWriter extends Writer {
  public write(s: string): this {
    return this;
  }
  public close(cb: () => void): void {
    setTimeout(cb, 4);
  }
}
