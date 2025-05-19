/**
 * Library entry point. Exports public-facing interfaces.
 */
import CallbackWriter from './classes/CallbackWritter.js';
import Emitter from './classes/Emitter.js';
import Writer from './classes/Writer.js';
import NopWriter from './classes/NopWriter.js';
import StreamWriter from './classes/StreamWriter.js';
export { Writer, CallbackWriter as CbWriter, NopWriter, StreamWriter, Emitter };
