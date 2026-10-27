import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CbWriter } from '../dist/index.js';
import {
  emitCreateContinuum,
  type ContinuumCheckHelper,
} from '../dist/classes/CreateContinuumEmission.js';

function captureWriter(): { writer: InstanceType<typeof CbWriter>; output: () => string } {
  let text = '';
  return {
    writer: new CbWriter(
      (s) => {
        text += s;
      },
      () => {},
    ),
    output: () => text,
  };
}

function markingSession(): {
  session: { markHelperAsUsed(name: string): void };
  marked: string[];
} {
  const marked: string[] = [];
  return {
    session: { markHelperAsUsed: (name) => marked.push(name) },
    marked,
  };
}

/** Worked examples from ADR-0001 leaf continuum motifs (independent expected strings). */
const leafCases: {
  check: ContinuumCheckHelper;
  earlyReturn: string;
  checkMultiArm: string;
  bare: string;
}[] = [
  {
    check: 'checkString',
    earlyReturn: 'if (!checkString(x, field + ".name", shouldThrow)) return d;\n',
    checkMultiArm: 'return checkString(v, "root", false);\n',
    bare: 'checkString(s, fieldName, true);\n',
  },
  {
    check: 'checkNumber',
    earlyReturn: 'if (!checkNumber(x, field + ".name", shouldThrow)) return d;\n',
    checkMultiArm: 'return checkNumber(v, "root", false);\n',
    bare: 'checkNumber(s, fieldName, true);\n',
  },
  {
    check: 'checkBoolean',
    earlyReturn: 'if (!checkBoolean(x, field + ".name", shouldThrow)) return d;\n',
    checkMultiArm: 'return checkBoolean(v, "root", false);\n',
    bare: 'checkBoolean(s, fieldName, true);\n',
  },
  {
    check: 'checkNull',
    earlyReturn: 'if (!checkNull(x, field + ".name", shouldThrow)) return d;\n',
    checkMultiArm: 'return checkNull(v, "root", false);\n',
    bare: 'checkNull(s, fieldName, true);\n',
  },
  {
    check: 'checkNever',
    earlyReturn: 'if (!checkNever(x, field + ".name", shouldThrow)) return d;\n',
    checkMultiArm: 'return checkNever(v, "root", false);\n',
    bare: 'checkNever(s, fieldName, true);\n',
  },
];

describe('Continuum emission', () => {
  for (const { check, earlyReturn, checkMultiArm, bare } of leafCases) {
    it(`Create early-return mode emits a failed-check early-return using the given return binding for ${check}`, () => {
      const { writer, output } = captureWriter();
      const { session } = markingSession();

      emitCreateContinuum({
        writer,
        session,
        mode: { kind: 'createEarlyReturn', returnBinding: 'd' },
        check,
        dataVar: 'x',
        fieldName: 'field + ".name"',
        shouldThrow: 'shouldThrow',
        tabLevel: 0,
      });

      assert.equal(output(), earlyReturn);
    });

    it(`checkMulti arm mode emits boolean branch success via return ${check}(…)`, () => {
      const { writer, output } = captureWriter();
      const { session } = markingSession();

      emitCreateContinuum({
        writer,
        session,
        mode: { kind: 'checkMultiArm' },
        check,
        dataVar: 'v',
        fieldName: '"root"',
        shouldThrow: false,
        tabLevel: 0,
      });

      assert.equal(output(), checkMultiArm);
    });

    it(`bare mode emits a ${check} call without Create early-return or multi-arm wrapping`, () => {
      const { writer, output } = captureWriter();
      const { session } = markingSession();

      emitCreateContinuum({
        writer,
        session,
        mode: { kind: 'bare' },
        check,
        dataVar: 's',
        fieldName: 'fieldName',
        shouldThrow: true,
        tabLevel: 0,
      });

      assert.equal(output(), bare);
    });
  }

  it('Record nested Create multi-arm mode emits assign-Create then return dataVar instanceof ProxyClass', () => {
    const { writer, output } = captureWriter();

    emitCreateContinuum({
      writer,
      mode: { kind: 'recordNestedMultiArm', proxyClass: 'PersonProxy' },
      dataVar: 'item',
      fieldName: 'field + "[i]"',
      shouldThrow: false,
      type: 'undefined',
      tabLevel: 0,
    });

    assert.equal(
      output(),
      'item = PersonProxy.Create(item, field + "[i]", undefined, false);\n' +
        'return item instanceof PersonProxy;\n',
    );
  });

  it('Record nested Create abort mode emits assign-Create then early-return when not instanceof ProxyClass', () => {
    const { writer, output } = captureWriter();

    emitCreateContinuum({
      writer,
      mode: { kind: 'recordNestedAbort', proxyClass: 'AddressProxy', returnBinding: 'false' },
      dataVar: 'el',
      fieldName: 'field + "[0]"',
      shouldThrow: 'shouldThrow',
      tabLevel: 0,
    });

    assert.equal(
      output(),
      'el = AddressProxy.Create(el, field + "[0]", undefined, shouldThrow);\n' +
        'if (!(el instanceof AddressProxy)) return false;\n',
    );
  });

  it('Record nested Create local mode emits assign-Create only (no instanceof abort)', () => {
    const { writer, output } = captureWriter();

    emitCreateContinuum({
      writer,
      mode: { kind: 'recordNestedLocal', proxyClass: 'AddressProxy' },
      dataVar: 'd["addr"]',
      fieldName: 'field + ".addr"',
      shouldThrow: 'shouldThrow',
      tabLevel: 0,
    });

    assert.equal(
      output(),
      'd["addr"] = AddressProxy.Create(d["addr"], field + ".addr", undefined, shouldThrow);\n',
    );
  });

  it('emitting a check* marks that helper as used on the emission session', () => {
    const { writer } = captureWriter();
    const { session, marked } = markingSession();

    emitCreateContinuum({
      writer,
      session,
      mode: { kind: 'bare' },
      check: 'checkNumber',
      dataVar: 'n',
      fieldName: '"age"',
      tabLevel: 0,
    });

    assert.deepEqual(marked, ['checkNumber']);
  });

  it('Create early-return mode emits a failed checkArray early-return with type label and return binding', () => {
    const { writer, output } = captureWriter();
    const { session, marked } = markingSession();

    emitCreateContinuum({
      writer,
      session,
      mode: { kind: 'createEarlyReturn', returnBinding: 'd' },
      check: 'checkArray',
      type: '"string[]"',
      dataVar: 'items',
      fieldName: 'field + ".items"',
      shouldThrow: 'shouldThrow',
      tabLevel: 0,
    });

    assert.equal(
      output(),
      'if (!checkArray(items, field + ".items", "string[]", shouldThrow)) return d;\n',
    );
    assert.deepEqual(marked, ['checkArray']);
  });

  it('checkMulti arm style checkArray failure early-returns false with type label', () => {
    const { writer, output } = captureWriter();
    const { session } = markingSession();

    emitCreateContinuum({
      writer,
      session,
      mode: { kind: 'createEarlyReturn', returnBinding: 'false' },
      check: 'checkArray',
      type: '"string[]"',
      dataVar: 'v',
      fieldName: '"root"',
      shouldThrow: false,
      tabLevel: 0,
    });

    assert.equal(
      output(),
      'if (!checkArray(v, "root", "string[]", false)) return false;\n',
    );
  });
});
