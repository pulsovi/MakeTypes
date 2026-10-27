# 03 — Migrate Collection & Any continuum emission
**Status:** delivered
**Delivered:** 2026-10-27
**Labels:** `enhancement`

**What to build:** Collection and Any Shapes keep their structural framing (element loops, `checkMulti([…])` scaffolding) but emit check / arm continuation through the continuum emission module — soft-fail Create behaviour unchanged.

**Blocked by:** 01 — Expand continuum emission module

## Acceptance criteria

- [x] Collection emits `checkArray` / element checks via continuum modes while retaining the element loop framing
- [x] AnyShape emits `checkMulti` scaffolding locally and each arm via continuum checkMulti arm mode
- [x] Nested abort vs parent-local soft-fail for collection multi-arm paths still matches ADR-0001
- [x] Existing e2e Create soft-fail suite still passes

## Seams

| Seam | Depends on |
|------|------------|
| `Collection continuum emission` | `Continuum emission` |
| `Any continuum emission` | `Continuum emission` |
| `Soft-fail Create runtime` | `—` |

### Behaviors

- [x] **Collection continuum emission**: Create early-return mode emits `checkArray` early-return then an element loop whose child checks use the continuum
- [x] **Collection continuum emission**: checkMulti arm mode emits `checkArray` failure→`return false`, element checks with abort-on-nested-record-soft-fail, then `return true`
- [x] **Collection continuum emission**: bare mode keeps array framing (`if (checkArray) { … }`) with continuum child checks inside
- [x] **Any continuum emission**: Create early-return mode wraps `checkMulti([…])` with early-return and arms emitted as continuum checkMulti arms
- [x] **Any continuum emission**: checkMulti arm mode returns the boolean result of nested `checkMulti` with continuum arms
- [x] **Any continuum emission**: bare mode emits `checkMulti([…])` with continuum arms and no Create early-return wrapper
- [x] **Soft-fail Create runtime**: existing e2e Create soft-fail suite still passes after Collection/Any migration

### Deliverables

- [x] Collection/Any continuum branch templates removed where continuation now delegates to the continuum module

### Out of scope

- Leaf / Record continuum migration (other tickets)
- Moving Collection loops or Any `checkMulti([…])` scaffolding into the continuum module
- Continuum flag removal from the Shape interface
- Proxy Create body scaffolding

## Parent

[Create continuum emission module](../spec.md)

## Comments

**2026-10-27 — Delivered**
Migrated CollectionShape `checkArray` Create/multi-arm gates onto `emitCreateContinuum` (extended continuum with `checkArray` + type arg); kept bare `if (checkArray) { … }` framing and element loops local. AnyShape keeps `checkMulti([…])` scaffolding; arms still enter via `asCheckMultiArm` so leaf/Collection continuation reaches the continuum. Writer-seam tests in `test/collection-any-continuum-emission.test.ts` (incl. nested abort vs parent-local). Validated with `node node_modules/typescript/bin/tsc` and `node --experimental-strip-types --test test/collection-any-continuum-emission.test.ts test/create-continuum-emission.test.ts test/leaf-shape-continuum-emission.test.ts test/create-soft-fail-early-return.test.ts` (55 pass). Record migration and Shape continuum flag removal deferred to later tickets.
