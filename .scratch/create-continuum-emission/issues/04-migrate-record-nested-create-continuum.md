# 04 — Migrate Record nested Create continuum
**Status:** delivered
**Delivered:** 2026-10-27
**Labels:** `enhancement`

**What to build:** Record nested Create continuation (assign `Create` + `instanceof` / abort) goes through the continuum emission module’s Record modes — soft-fail Create behaviour unchanged; record/root Create body scaffolding stays put.

**Blocked by:** 01 — Expand continuum emission module

## Acceptance criteria

- [x] Record `emitProxyTypeCheck` uses continuum Record nested Create modes for multi-arm and abort continuation
- [x] Field checks from record Create still soft-fail via continuum Create early-return (directly or via migrated leaves)
- [x] Existing e2e Create soft-fail suite still passes
- [x] Record/root Proxy Create class scaffolding not rewritten as a Create-body module

## Seams

| Seam | Depends on |
|------|------------|
| `Record nested Create continuum` | `Continuum emission` |
| `Soft-fail Create runtime` | `—` |

### Behaviors

- [x] **Record nested Create continuum**: checkMulti arm path emits continuum Record multi-arm motif (`Create` assign + `instanceof` boolean)
- [x] **Record nested Create continuum**: abort path emits continuum Record abort motif (`Create` assign + early-return when not `instanceof`)
- [x] **Record nested Create continuum**: parent Create path without abort leaves nested soft-fail local (no abort motif) *(covers ADR nested locality)*
- [x] **Soft-fail Create runtime**: existing e2e Create soft-fail suite still passes after Record continuum migration

### Deliverables

- [x] RecordShape continuum continuation for nested Create delegated to the continuum module

### Out of scope

- Collapsing record/root Create body (clone, unknown properties, `new Proxy`) into a Create-body emitter
- Continuum flag removal from the Shape interface (contract ticket)
- Leaf / Collection / Any migration (other tickets)

## Parent

[Create continuum emission module](../spec.md)

## Comments

**2026-10-27 — Delivered**
Migrated `RecordShape.emitProxyTypeCheck` onto continuum Record nested modes (`recordNestedMultiArm` / `recordNestedAbort` / `recordNestedLocal`); added `recordNestedLocal` for parent-Create nested locality. Field soft-fail still reaches continuum Create early-return via migrated leaves (`earlyReturnVar: 'd'`). Writer-seam tests in `test/record-nested-create-continuum-emission.test.ts`. Validated with `node node_modules/typescript/bin/tsc` and `node --experimental-strip-types --test test/record-nested-create-continuum-emission.test.ts test/create-continuum-emission.test.ts test/collection-any-continuum-emission.test.ts test/leaf-shape-continuum-emission.test.ts test/create-soft-fail-early-return.test.ts` (60 pass). Shape continuum flag removal deferred to ticket 05.
