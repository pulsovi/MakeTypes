import ts from 'typescript';
import { CbWriter, Emitter, NopWriter } from '../../dist/index.js';

/** Emit proxy source for the given sample(s) under rootName. */
export function emitProxySource(sample: unknown, rootName: string): string {
  let proxies = '';
  const emitter = new Emitter(
    new NopWriter(),
    new CbWriter(
      (s) => {
        proxies += s;
      },
      () => {},
    ),
  );
  emitter.emit(sample, rootName);
  return proxies;
}

/** Transpile generated TypeScript proxies and import them via a data URI. */
export async function loadGeneratedProxy(
  sample: unknown,
  rootName: string,
): Promise<{ source: string; module: Record<string, unknown> }> {
  const source = emitProxySource(sample, rootName);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      strict: false,
    },
  });
  const module = await import(
    `data:text/javascript;charset=utf-8,${encodeURIComponent(outputText)}`
  );
  return { source, module };
}

export function proxyClass(
  module: Record<string, unknown>,
  rootName: string,
): { Create: (d: unknown, field?: string, type?: string, shouldThrow?: boolean) => unknown } {
  const cls = module[`${rootName}Proxy`];
  if (typeof cls !== 'function') {
    throw new Error(`Expected ${rootName}Proxy export, got ${typeof cls}`);
  }
  return cls as {
    Create: (d: unknown, field?: string, type?: string, shouldThrow?: boolean) => unknown;
  };
}
