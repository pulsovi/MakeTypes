"use strict";
/**
 * Library entry point. Exports public-facing interfaces.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emitter = exports.Types = exports.StreamWriter = exports.NopWriter = exports.CbWriter = exports.Writer = void 0;
const writer_1 = __importDefault(require("./lib/writer"));
exports.Writer = writer_1.default;
const cb_writer_1 = __importDefault(require("./lib/cb_writer"));
exports.CbWriter = cb_writer_1.default;
const nop_writer_1 = __importDefault(require("./lib/nop_writer"));
exports.NopWriter = nop_writer_1.default;
const stream_writer_1 = __importDefault(require("./lib/stream_writer"));
exports.StreamWriter = stream_writer_1.default;
const Types = __importStar(require("./lib/types"));
exports.Types = Types;
const emit_1 = __importDefault(require("./lib/emit"));
Object.defineProperty(exports, "Emitter", { enumerable: true, get: function () { return emit_1.default; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsMERBQWtDO0FBTzFCLGlCQVBELGdCQUFNLENBT0M7QUFOZCxnRUFBdUM7QUFNdkIsbUJBTlQsbUJBQVEsQ0FNUztBQUx4QixrRUFBeUM7QUFLZixvQkFMbkIsb0JBQVMsQ0FLbUI7QUFKbkMsd0VBQStDO0FBSVYsdUJBSjlCLHVCQUFZLENBSThCO0FBSGpELG1EQUFxQztBQUdjLHNCQUFLO0FBRnhELHNEQUE4QztBQUVZLHdGQUZ2QyxjQUFPLE9BRXVDIn0=