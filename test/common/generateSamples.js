#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var lib_1 = require("../../dist/lib");
var outdir = path.join(__dirname, "../generated");
var sampledir = path.join(__dirname, "../samples");
fs.readdirSync(sampledir)
    .filter(function (d) { return path.extname(d).toLowerCase() === '.json'; })
    .forEach(function (d) {
    var name = d.slice(0, d.length - 5);
    console.log("Emitting ".concat(name, "..."));
    var interfaceWriter = new lib_1.StreamWriter(fs.createWriteStream(path.join(outdir, "".concat(name, ".ts"))));
    var proxyWriter = new lib_1.StreamWriter(fs.createWriteStream(path.join(outdir, "".concat(name, "Proxy.ts"))));
    var samples = JSON.parse(fs.readFileSync(path.join(sampledir, d)).toString());
    var e = new lib_1.Emitter(interfaceWriter, proxyWriter);
    e.emit(samples, name);
});
