import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CbWriter, Emitter, NopWriter } from '../dist/index.js';
import { AnyShape } from '../dist/classes/AnyShape.js';
import { CollectionShape } from '../dist/classes/CollectionShape.js';
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

function stringCollection(): CollectionShape {
  return new CollectionShape({
    baseShape: new StringShape({ samples: ['a'] }),
    samples: [['a']],
  });
}

function stringOrNumberAny(): AnyShape {
  return new AnyShape({
    shapes: [new StringShape({ samples: ['x'] }), new NumberShape({ samples: [1] })],
    samples: ['x', 1],
  });
}

describe('Collection continuum emission', () => {
  it('Create early-return mode emits checkArray early-return then an element loop whose child checks use the continuum', () => {
    const { emitter, output } = captureEmitter();

    stringCollection().emitProxyTypeCheck({
      emitter,
      tabLevel: 0,
      dataVar: 'items',
      fieldName: 'field + ".items"',
      shouldThrow: 'shouldThrow',
      earlyReturnVar: 'd',
    });

    assert.equal(
      output(),
      'if (!checkArray(items, field + ".items", "string[]", shouldThrow)) return d;\n' +
        'for (let i = 0; i < items.length; i++) {\n' +
        '  if (!checkString(items[i], field + ".items" + "[" + i + "]", shouldThrow)) return d;\n' +
        '}\n',
    );
  });

  it('checkMulti arm mode emits checkArray failure→return false, element checks with abort-on-nested-record-soft-fail, then return true', () => {
    const { emitter, output } = captureEmitter();
    const fields = new Map([['n', new NumberShape({ samples: [1] })]]);
    const record = RecordShape.Create(emitter, { fields, samples: [{ n: 1 }] });
    const coll = new CollectionShape({ baseShape: record, samples: [[{ n: 1 }]] });

    coll.emitProxyTypeCheck({
      emitter,
      tabLevel: 0,
      dataVar: 'v',
      fieldName: '"root"',
      shouldThrow: false,
      asCheckMultiArm: true,
    });

    assert.equal(
      output(),
      'if (!checkArray(v, "root", "EntityProxy[]", false)) return false;\n' +
        'for (let i = 0; i < v.length; i++) {\n' +
        '  v[i] = EntityProxy.Create(v[i], "root" + "[" + i + "]", undefined, false);\n' +
        '  if (!(v[i] instanceof EntityProxy)) return false;\n' +
        '}\n' +
        'return true;\n',
    );
  });

  it('bare mode keeps array framing (if (checkArray) { … }) with continuum child checks inside', () => {
    const { emitter, output } = captureEmitter();

    stringCollection().emitProxyTypeCheck({
      emitter,
      tabLevel: 0,
      dataVar: 's',
      fieldName: 'fieldName',
      shouldThrow: true,
    });

    assert.equal(
      output(),
      'if (checkArray(s, fieldName, "string[]", true)) {\n' +
        '  for (let i = 0; i < s.length; i++) {\n' +
        '    checkString(s[i], fieldName + "[" + i + "]", true);\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('parent Create early-return for collection-of-record keeps nested soft-fail local (no instanceof abort)', () => {
    const { emitter, output } = captureEmitter();
    const fields = new Map([['n', new NumberShape({ samples: [1] })]]);
    const record = RecordShape.Create(emitter, { fields, samples: [{ n: 1 }] });
    const coll = new CollectionShape({ baseShape: record, samples: [[{ n: 1 }]] });

    coll.emitProxyTypeCheck({
      emitter,
      tabLevel: 0,
      dataVar: 'items',
      fieldName: 'field + ".items"',
      shouldThrow: 'shouldThrow',
      earlyReturnVar: 'd',
    });

    assert.equal(
      output(),
      'if (!checkArray(items, field + ".items", "EntityProxy[]", shouldThrow)) return d;\n' +
        'for (let i = 0; i < items.length; i++) {\n' +
        '  items[i] = EntityProxy.Create(items[i], field + ".items" + "[" + i + "]", undefined, shouldThrow);\n' +
        '}\n',
    );
  });
});

describe('Any continuum emission', () => {
  it('Create early-return mode wraps checkMulti([…]) with early-return and arms emitted as continuum checkMulti arms', () => {
    const { emitter, output } = captureEmitter();

    stringOrNumberAny().emitProxyTypeCheck({
      emitter,
      tabLevel: 0,
      dataVar: 'x',
      fieldName: 'field + ".v"',
      shouldThrow: 'shouldThrow',
      earlyReturnVar: 'd',
    });

    assert.equal(
      output(),
      'if (!checkMulti([\n' +
        '  () => {\n' +
        '    return checkString(x, field + ".v", false);\n' +
        '  },\n' +
        '  () => {\n' +
        '    return checkNumber(x, field + ".v", false);\n' +
        '  },\n' +
        '], x, field + ".v", "string | number", shouldThrow)) return d;\n',
    );
  });

  it('checkMulti arm mode returns the boolean result of nested checkMulti with continuum arms', () => {
    const { emitter, output } = captureEmitter();

    stringOrNumberAny().emitProxyTypeCheck({
      emitter,
      tabLevel: 0,
      dataVar: 'v',
      fieldName: '"root"',
      shouldThrow: false,
      asCheckMultiArm: true,
    });

    assert.equal(
      output(),
      'return checkMulti([\n' +
        '  () => {\n' +
        '    return checkString(v, "root", false);\n' +
        '  },\n' +
        '  () => {\n' +
        '    return checkNumber(v, "root", false);\n' +
        '  },\n' +
        '], v, "root", "string | number", false);\n',
    );
  });

  it('bare mode emits checkMulti([…]) with continuum arms and no Create early-return wrapper', () => {
    const { emitter, output } = captureEmitter();

    stringOrNumberAny().emitProxyTypeCheck({
      emitter,
      tabLevel: 0,
      dataVar: 's',
      fieldName: 'fieldName',
      shouldThrow: true,
    });

    assert.equal(
      output(),
      'checkMulti([\n' +
        '  () => {\n' +
        '    return checkString(s, fieldName, false);\n' +
        '  },\n' +
        '  () => {\n' +
        '    return checkNumber(s, fieldName, false);\n' +
        '  },\n' +
        '], s, fieldName, "string | number", true);\n',
    );
  });
});
