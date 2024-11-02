#!/usr/bin/env node
import * as yargs from 'yargs';
import * as fs from 'fs';
import * as path from 'path';

import {StreamWriter, NopWriter, Emitter} from './lib/index';

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

let interfaceWriter = new NopWriter();
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
  interfaceWriter = new StreamWriter(fs.createWriteStream(argv.i));
}
// @ts-ignore
if (argv.p) {
// @ts-ignore
  proxyWriter = new StreamWriter(fs.createWriteStream(argv.p));
}
// @ts-ignore
if (argv._.length !== 2) {
  console.error(`Please supply an input file with samples in a JSON array, and a symbol to use for the root interface / proxy.`);
  yargs.showHelp();
  process.exit(1);
}
// @ts-ignore
const samples = JSON.parse(fs.readFileSync(argv._[0]).toString());
const e = new Emitter(interfaceWriter, proxyWriter);
// @ts-ignore
e.emit(samples, argv._[1]);
