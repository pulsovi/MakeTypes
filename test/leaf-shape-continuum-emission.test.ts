import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CbWriter, Emitter, NopWriter } from '../dist/index.js';
import { BooleanShape } from '../dist/classes/BooleanShape.js';
import { NeverShape } from '../dist/classes/NeverShape.js';
import { NullShape } from '../dist/classes/NullShape.js';
import { NumberShape } from '../dist/classes/NumberShape.js';
import { StringShape } from '../dist/classes/StringShape.js';
import type { Shape } from '../dist/classes/Shape.js';

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

/** Worked continuum motifs for leaf Create paths (independent expected strings). */
const leafCases: {
  name: string;
  shape: () => Shape;
  earlyReturn: string;
  checkMultiArm: string;
  bare: string;
}[] = [
  {
    name: 'string',
    shape: () => new StringShape({ samples: ['x'] }),
    earlyReturn: 'if (!checkString(x, field + ".name", shouldThrow)) return d;\n',
    checkMultiArm: 'return checkString(v, "root", false);\n',
    bare: 'checkString(s, fieldName, true);\n',
  },
  {
    name: 'number',
    shape: () => new NumberShape({ samples: [1] }),
    earlyReturn: 'if (!checkNumber(x, field + ".name", shouldThrow)) return d;\n',
    checkMultiArm: 'return checkNumber(v, "root", false);\n',
    bare: 'checkNumber(s, fieldName, true);\n',
  },
  {
    name: 'boolean',
    shape: () => new BooleanShape({ samples: [true] }),
    earlyReturn: 'if (!checkBoolean(x, field + ".name", shouldThrow)) return d;\n',
    checkMultiArm: 'return checkBoolean(v, "root", false);\n',
    bare: 'checkBoolean(s, fieldName, true);\n',
  },
  {
    name: 'null',
    shape: () => new NullShape({ samples: [null] }),
    earlyReturn: 'if (!checkNull(x, field + ".name", shouldThrow)) return d;\n',
    checkMultiArm: 'return checkNull(v, "root", false);\n',
    bare: 'checkNull(s, fieldName, true);\n',
  },
  {
    name: 'never',
    shape: () => new NeverShape(),
    earlyReturn: 'if (!checkNever(x, field + ".name", shouldThrow)) return d;\n',
    checkMultiArm: 'return checkNever(v, "root", false);\n',
    bare: 'checkNever(s, fieldName, true);\n',
  },
];

describe('Leaf emitProxyTypeCheck', () => {
  for (const { name, shape, earlyReturn, checkMultiArm, bare } of leafCases) {
    it(`Create early-return mode for a ${name} leaf emits the continuum early-return motif`, () => {
      const { emitter, output } = captureEmitter();

      shape().emitProxyTypeCheck({
        emitter,
        tabLevel: 0,
        dataVar: 'x',
        fieldName: 'field + ".name"',
        shouldThrow: 'shouldThrow',
        earlyReturnVar: 'd',
      });

      assert.equal(output(), earlyReturn);
    });

    it(`checkMulti arm mode for a ${name} leaf emits the continuum multi-arm motif`, () => {
      const { emitter, output } = captureEmitter();

      shape().emitProxyTypeCheck({
        emitter,
        tabLevel: 0,
        dataVar: 'v',
        fieldName: '"root"',
        shouldThrow: false,
        asCheckMultiArm: true,
      });

      assert.equal(output(), checkMultiArm);
    });

    it(`bare mode for a ${name} leaf emits the continuum bare check* motif`, () => {
      const { emitter, output } = captureEmitter();

      shape().emitProxyTypeCheck({
        emitter,
        tabLevel: 0,
        dataVar: 's',
        fieldName: 'fieldName',
        shouldThrow: true,
      });

      assert.equal(output(), bare);
    });
  }
});
