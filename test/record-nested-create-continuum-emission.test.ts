import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CbWriter, Emitter, NopWriter } from '../dist/index.js';
import { NumberShape } from '../dist/classes/NumberShape.js';
import { RecordShape } from '../dist/classes/RecordShape.js';
import { StringShape } from '../dist/classes/StringShape.js';

function captureEmitter(): {
  emitter: Emitter;
  output: () => string;
} {
  let text = '';
  const emitter = new Emitter(
    new NopWriter(),
    new CbWriter(
      (s) => {
        text += s;
      },
      () => {},
    ),
  );
  return { emitter, output: () => text };
}

function personRecord(emitter: Emitter): RecordShape {
  const fields = new Map([
    ['name', new StringShape({ samples: ['a'] })],
    ['age', new NumberShape({ samples: [1] })],
  ]);
  return RecordShape.Create(emitter, { fields, samples: [{ name: 'a', age: 1 }] });
}

describe('Record nested Create continuum', () => {
  it('checkMulti arm path emits continuum Record multi-arm motif (Create assign + instanceof boolean)', () => {
    const { emitter, output } = captureEmitter();
    const record = personRecord(emitter);

    record.emitProxyTypeCheck({
      emitter,
      tabLevel: 0,
      dataVar: 'item',
      fieldName: 'field + "[i]"',
      shouldThrow: false,
      asCheckMultiArm: true,
    });

    assert.equal(
      output(),
      'item = Proxy.Create(item, field + "[i]", undefined, false);\n' +
        'return item instanceof Proxy;\n',
    );
  });

  it('abort path emits continuum Record abort motif (Create assign + early-return when not instanceof)', () => {
    const { emitter, output } = captureEmitter();
    const record = personRecord(emitter);

    record.emitProxyTypeCheck({
      emitter,
      tabLevel: 0,
      dataVar: 'el',
      fieldName: 'field + "[0]"',
      shouldThrow: 'shouldThrow',
      earlyReturnVar: 'false',
      abortRecordSoftFail: true,
    });

    assert.equal(
      output(),
      'el = Proxy.Create(el, field + "[0]", undefined, shouldThrow);\n' +
        'if (!(el instanceof Proxy)) return false;\n',
    );
  });

  it('parent Create path without abort leaves nested soft-fail local (no abort motif)', () => {
    const { emitter, output } = captureEmitter();
    const record = personRecord(emitter);

    record.emitProxyTypeCheck({
      emitter,
      tabLevel: 0,
      dataVar: 'd["addr"]',
      fieldName: 'field + ".addr"',
      shouldThrow: 'shouldThrow',
      earlyReturnVar: 'd',
    });

    assert.equal(
      output(),
      'd["addr"] = Proxy.Create(d["addr"], field + ".addr", undefined, shouldThrow);\n',
    );
  });
});

describe('Soft-fail Create via Record field continuum', () => {
  it('record Create field checks soft-fail via continuum Create early-return', () => {
    const { emitter, output } = captureEmitter();
    const fields = new Map([['n', new NumberShape({ samples: [1] })]]);
    const record = RecordShape.Create(emitter, { fields, samples: [{ n: 1 }] });

    record.emitProxyClass(emitter);

    const source = output();
    assert.match(
      source,
      /if \(!checkNumber\(d\.n, field \+ "\.n", shouldThrow\)\) return d;/,
    );
    assert.match(source, /if \(!checkRecord\(d, field, type \|\| "Proxy", shouldThrow\)\) return d;/);
  });
});
