#!/usr/bin/env node
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = __importStar(require("yargs"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const index_1 = require("./lib/index");
const argv = yargs.usage('Usage: $0 [options] inputFile rootName')
    .alias('i', 'interface-file')
    .string('i')
    .describe('i', 'Specify output file for interfaces')
    .alias('p', 'proxy-file')
    .string('p')
    .describe('p', 'Specity output file for TypeScript proxy classes')
    .help('h')
    .alias('h', 'help')
    .argv;
let interfaceWriter = new index_1.NopWriter();
let proxyWriter = interfaceWriter;
// @ts-ignore
if (argv.i && argv.p && path.resolve(argv.i) === path.resolve(argv.p)) {
    console.error(`Interfaces and proxies cannot be written to same file.`);
    yargs.showHelp();
    process.exit(1);
}
// @ts-ignore
if (argv.i) {
    // @ts-ignore
    interfaceWriter = new index_1.StreamWriter(fs.createWriteStream(argv.i));
}
// @ts-ignore
if (argv.p) {
    // @ts-ignore
    proxyWriter = new index_1.StreamWriter(fs.createWriteStream(argv.p));
}
// @ts-ignore
if (argv._.length !== 2) {
    console.error(`Please supply an input file with samples in a JSON array, and a symbol to use for the root interface / proxy.`);
    yargs.showHelp();
    process.exit(1);
}
// @ts-ignore
const samples = JSON.parse(fs.readFileSync(argv._[0]).toString());
const e = new index_1.Emitter(interfaceWriter, proxyWriter);
// @ts-ignore
e.emit(samples, argv._[1]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLDZDQUErQjtBQUMvQix1Q0FBeUI7QUFDekIsMkNBQTZCO0FBRTdCLHVDQUE2RDtBQUU3RCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxDQUFDO0tBQy9ELEtBQUssQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUM7S0FDNUIsTUFBTSxDQUFDLEdBQUcsQ0FBQztLQUNYLFFBQVEsQ0FBQyxHQUFHLEVBQUUsb0NBQW9DLENBQUM7S0FDbkQsS0FBSyxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUM7S0FDeEIsTUFBTSxDQUFDLEdBQUcsQ0FBQztLQUNYLFFBQVEsQ0FBQyxHQUFHLEVBQUUsa0RBQWtELENBQUM7S0FDakUsSUFBSSxDQUFDLEdBQUcsQ0FBQztLQUNULEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDO0tBQ2xCLElBQUksQ0FBQztBQUVSLElBQUksZUFBZSxHQUFHLElBQUksaUJBQVMsRUFBRSxDQUFDO0FBQ3RDLElBQUksV0FBVyxHQUFHLGVBQWUsQ0FBQztBQUNsQyxhQUFhO0FBQ2IsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUN0RSxPQUFPLENBQUMsS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7SUFDeEUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQUNELGFBQWE7QUFDYixJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNiLGFBQWE7SUFDWCxlQUFlLEdBQUcsSUFBSSxvQkFBWSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBQ0QsYUFBYTtBQUNiLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ2IsYUFBYTtJQUNYLFdBQVcsR0FBRyxJQUFJLG9CQUFZLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFDRCxhQUFhO0FBQ2IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztJQUN4QixPQUFPLENBQUMsS0FBSyxDQUFDLCtHQUErRyxDQUFDLENBQUM7SUFDL0gsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQUNELGFBQWE7QUFDYixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDbEUsTUFBTSxDQUFDLEdBQUcsSUFBSSxlQUFPLENBQUMsZUFBZSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ3BELGFBQWE7QUFDYixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMifQ==