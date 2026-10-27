# 05 — Contract continuum flags → mode interface
**Status:** delivered
**Delivered:** 2026-10-27
**Labels:** `enhancement`

**What to build:** Callers pass a closed continuum **mode** into `emitProxyTypeCheck`; `earlyReturnVar` / `asCheckMultiArm` / `abortRecordSoftFail` leave the Shape continuum interface — soft-fail Create behaviour unchanged.

**Blocked by:** 02 — Migrate leaf Shape continuum emission; 03 — Migrate Collection & Any continuum emission; 04 — Migrate Record nested Create continuum

## Acceptance criteria

- [x] Continuum callers (record Create fields, root Create, Collection children, Any arms) pass continuum mode rather than the three continuum flags
- [x] Those continuum flags are removed from the Shape continuum interface
- [x] Existing e2e Create soft-fail suite still passes

## Seams

| Seam | Depends on |
|------|------------|
| `Continuum mode interface` | `Continuum emission` |
| `Soft-fail Create runtime` | `—` |

### Behaviors

- [x] **Continuum mode interface**: record Create field checks are invoked with Create early-return mode (return binding for the record input)
- [x] **Continuum mode interface**: root non-record Create checks are invoked with Create early-return mode (root return binding)
- [x] **Continuum mode interface**: Collection child checks pass the continuum mode required for Create early-return vs multi-arm abort
- [x] **Continuum mode interface**: AnyShape arms are invoked with checkMulti arm mode
- [x] **Continuum mode interface**: Shape continuum interface no longer accepts `earlyReturnVar` / `asCheckMultiArm` / `abortRecordSoftFail` *(non-testable)*
- [x] **Soft-fail Create runtime**: existing e2e Create soft-fail suite still passes after contract

### Deliverables

- [x] Continuum flags deleted from the Shape continuum interface; callers updated to modes

### Out of scope

- Further deepening of Proxy Create body emission
- Changing ADR-0001 runtime semantics

## Parent

[Create continuum emission module](../spec.md)

## Comments

**2026-10-27 — Delivered**
Contracted `EmitProxyTypeCheckArgs` to require `mode: ContinuumMode`; removed `earlyReturnVar` / `asCheckMultiArm` / `abortRecordSoftFail`. Updated Record Create fields, root Create (`Emitter`), Collection children, Any arms, and leaf/Collection/Any/Record adapters to pass closed modes (Record-shaped polymorphic sites use nested Record modes preserving prior soft-fail locality). Writer-seam tests updated; soft-fail e2e unchanged. Validated with `node node_modules/typescript/bin/tsc` and `node --experimental-strip-types --test test/leaf-shape-continuum-emission.test.ts test/collection-any-continuum-emission.test.ts test/record-nested-create-continuum-emission.test.ts test/create-continuum-emission.test.ts test/create-soft-fail-early-return.test.ts` (60 pass). Code-review since `9290ec7`: Standards judgement smells only (casts / mode helpers); Spec green.
