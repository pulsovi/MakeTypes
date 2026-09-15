import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  loadGeneratedProxy,
  proxyClass,
} from './helpers/loadGeneratedProxy.ts';

afterEach(() => {
  delete (globalThis as { handleProxyError?: unknown }).handleProxyError;
});

function assertRawSoftFail(
  result: unknown,
  ProxyCtor: unknown,
  expected: unknown,
): void {
  assert.equal(
    result instanceof (ProxyCtor as new (...args: never[]) => unknown),
    false,
  );
  assert.deepEqual(result, expected);
}

describe('Record Create soft-fail early-return', () => {
  const sample = { name: 'ada', age: 36 };

  it('calls checkRecord as (value, field, type) matching the helper signature', async () => {
    const { source } = await loadGeneratedProxy(sample, 'Person');
    assert.match(
      source,
      /checkRecord\(\s*d\s*,\s*field\s*,/,
      'checkRecord call sites must pass value before field',
    );
    assert.doesNotMatch(source, /checkRecord\(\s*field\s*,\s*d\s*,/);
  });

  it('on non-object input soft path returns the input unchanged, not a Proxy', async () => {
    const { module } = await loadGeneratedProxy(sample, 'Person');
    const PersonProxy = proxyClass(module, 'Person');
    const input = 'not-an-object';
    assertRawSoftFail(PersonProxy.Create(input), PersonProxy, input);
  });

  it('on wrong field type soft path returns the input unchanged, not a Proxy', async () => {
    const { module } = await loadGeneratedProxy(sample, 'Person');
    const PersonProxy = proxyClass(module, 'Person');
    const input = { name: 99, age: 36 };
    assertRawSoftFail(PersonProxy.Create(input), PersonProxy, input);
  });

  it('on unknown property soft path returns the input unchanged, not a Proxy', async () => {
    const { module } = await loadGeneratedProxy(sample, 'Person');
    const PersonProxy = proxyClass(module, 'Person');
    const input = { name: 'ada', age: 36, extra: true };
    assertRawSoftFail(PersonProxy.Create(input), PersonProxy, input);
  });

  it('on first failed check soft path runs no further checks in that invocation', async () => {
    const { module } = await loadGeneratedProxy(sample, 'Person');
    const PersonProxy = proxyClass(module, 'Person');
    const reports: string[] = [];
    (globalThis as { handleProxyError: Function }).handleProxyError = (
      _proxyName: string,
      _raw: unknown,
      error: { path: string[] },
    ) => {
      reports.push(error.path.join('.'));
    };
    // Fields are checked in alphabetical order: age before name.
    PersonProxy.Create({ name: 1, age: 'bad' });
    assert.deepEqual(reports, ['root.age']);
  });

  it('when every check succeeds returns a Proxy instance', async () => {
    const { module } = await loadGeneratedProxy(sample, 'Person');
    const PersonProxy = proxyClass(module, 'Person');
    const result = PersonProxy.Create(sample);
    assert.ok(result instanceof (PersonProxy as unknown as new (...args: never[]) => unknown));
    assert.equal((result as { name: string }).name, 'ada');
    assert.equal((result as { age: number }).age, 36);
  });

  it('when shouldThrow is false a failed check does not call errorHelper and returns the input', async () => {
    const { module } = await loadGeneratedProxy(sample, 'Person');
    const PersonProxy = proxyClass(module, 'Person');
    let called = false;
    (globalThis as { handleProxyError: Function }).handleProxyError = () => {
      called = true;
    };
    const input = { name: 1, age: 36 };
    const result = PersonProxy.Create(input, 'root', undefined, false);
    assert.equal(called, false);
    assertRawSoftFail(result, PersonProxy, input);
  });
});

describe('Root non-record Create soft-fail', () => {
  it('on first failed check soft path returns the input unchanged', async () => {
    const { module } = await loadGeneratedProxy(42, 'Answer');
    const AnswerProxy = proxyClass(module, 'Answer');
    const input = 'nope';
    assertRawSoftFail(AnswerProxy.Create(input), AnswerProxy, input);
  });

  it('when the root continuum succeeds returns the checked value', async () => {
    const { module } = await loadGeneratedProxy(42, 'Answer');
    const AnswerProxy = proxyClass(module, 'Answer');
    assert.equal(AnswerProxy.Create(42), 42);
  });
});

describe('Collection continuum soft-fail', () => {
  it('on failed checkArray soft path does not walk elements', async () => {
    const sample = { items: [{ n: 1 }] };
    const { module } = await loadGeneratedProxy(sample, 'Bag');
    const BagProxy = proxyClass(module, 'Bag');
    const reports: string[] = [];
    (globalThis as { handleProxyError: Function }).handleProxyError = (
      _proxyName: string,
      _raw: unknown,
      error: { path: string[] },
    ) => {
      reports.push(error.path.join('.'));
    };
    // Non-array items: must soft-fail at checkArray, not throw walking .length / elements.
    const input = { items: 'not-an-array' };
    assertRawSoftFail(BagProxy.Create(input), BagProxy, input);
    assert.deepEqual(reports, ['root.items']);
  });
});

describe('Nested Create soft-fail is local', () => {
  it('nested soft-fail stops only that nested invocation; parent may still return a Proxy', async () => {
    const sample = { child: { n: 1 }, label: 'ok' };
    const { module } = await loadGeneratedProxy(sample, 'Parent');
    const ParentProxy = proxyClass(module, 'Parent');
    const ChildProxy = module['ChildProxy'] as new (...args: never[]) => unknown;
    const input = { child: { n: 'bad' }, label: 'ok' };
    const result = ParentProxy.Create(input) as {
      child: unknown;
      label: string;
    };
    assert.ok(result instanceof (ParentProxy as unknown as new (...args: never[]) => unknown));
    assert.equal(result.label, 'ok');
    assert.equal(result.child instanceof ChildProxy, false);
    assert.deepEqual(result.child, { n: 'bad' });
  });
});

describe('checkMulti arms boolean success', () => {
  it('record arm success is instanceof ThatProxy; primitive arm uses check* boolean', async () => {
    const samples = [{ value: { n: 1 } }, { value: 'hello' }];
    const { source, module } = await loadGeneratedProxy(samples, 'Wrap');
    assert.match(
      source,
      /return\s+[\w.[\]]+?\s+instanceof\s+\w+/,
      'record checkMulti arms must use instanceof for branch success',
    );
    assert.match(
      source,
      /return\s+checkString\(/,
      'primitive checkMulti arms must return the check* boolean',
    );

    const WrapProxy = proxyClass(module, 'Wrap');
    const okRecord = WrapProxy.Create({ value: { n: 1 } });
    assert.ok(okRecord instanceof (WrapProxy as unknown as new (...args: never[]) => unknown));

    const okString = WrapProxy.Create({ value: 'hello' });
    assert.ok(okString instanceof (WrapProxy as unknown as new (...args: never[]) => unknown));
    assert.equal((okString as { value: string }).value, 'hello');

    const soft = WrapProxy.Create({ value: true });
    assertRawSoftFail(soft, WrapProxy, { value: true });
  });

  it('collection arm fails the branch when an element soft-fails', async () => {
    const samples = [{ value: [{ n: 1 }] }, { value: 'hello' }];
    const { module } = await loadGeneratedProxy(samples, 'Wrap');
    const WrapProxy = proxyClass(module, 'Wrap');
    // Bad element in array arm must not win the union via a always-true collection arm.
    assertRawSoftFail(WrapProxy.Create({ value: [{ n: 'bad' }] }), WrapProxy, {
      value: [{ n: 'bad' }],
    });
  });
});
