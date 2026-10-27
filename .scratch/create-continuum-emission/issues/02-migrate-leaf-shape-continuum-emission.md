# 02 — Migrate leaf Shape continuum emission
**Status:** delivered
**Delivered:** 2026-10-27
**Labels:** `enhancement`

**What to build:** Leaf Shapes (string, number, boolean, null, never) delegate Create continuum continuation to the continuum emission module so their `emitProxyTypeCheck` no longer owns early-return / multi-arm / bare branching — soft-fail Create behaviour unchanged.

**Blocked by:** 01 — Expand continuum emission module

## Acceptance criteria

- [x] Leaf `emitProxyTypeCheck` paths emit continuum continuation via the continuum module for Create early-return, checkMulti arm, and bare modes
- [x] Leaf Shapes no longer duplicate continuum branch templates for those modes
- [x] Existing e2e Create soft-fail suite still passes

## Seams

| Seam | Depends on |
|------|------------|
| `Leaf emitProxyTypeCheck` | `Continuum emission` |
| `Soft-fail Create runtime` | `—` |

### Behaviors

- [x] **Leaf emitProxyTypeCheck**: Create early-return mode for a leaf emits the continuum early-return motif (cases: string, number, boolean, null, never)
- [x] **Leaf emitProxyTypeCheck**: checkMulti arm mode for a leaf emits the continuum multi-arm motif (cases: string, number, boolean, null, never)
- [x] **Leaf emitProxyTypeCheck**: bare mode for a leaf emits the continuum bare `check*` motif (cases: string, number, boolean, null, never)
- [x] **Soft-fail Create runtime**: existing e2e Create soft-fail suite still passes after leaf migration

### Deliverables

- [x] Leaf Shape continuum branching removed in favour of continuum module delegation

### Out of scope

- Collection / Any / Record continuum migration
- Continuum flag removal from the Shape interface (contract ticket)
- Proxy Create body scaffolding

## Parent

[Create continuum emission module](../spec.md)

## Comments

**2026-10-27 — Delivered**
Migrated String/Number/Boolean/Null/Never `emitProxyTypeCheck` onto `emitCreateContinuum` (Create early-return, checkMulti arm, bare); removed duplicated leaf continuum writeln templates. Leaf Writer-seam tests in `test/leaf-shape-continuum-emission.test.ts`. Validated with `node node_modules/typescript/bin/tsc` and `node --experimental-strip-types --test test/leaf-shape-continuum-emission.test.ts test/create-continuum-emission.test.ts test/create-soft-fail-early-return.test.ts` (46 pass). Collection/Any/Record migration and Shape continuum flag removal deferred to later tickets.
