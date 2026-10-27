# 03 — Migrate Collection & Any continuum emission
**Status:** open
**Triage:** ready-for-agent
**Labels:** `enhancement`

**What to build:** Collection and Any Shapes keep their structural framing (element loops, `checkMulti([…])` scaffolding) but emit check / arm continuation through the continuum emission module — soft-fail Create behaviour unchanged.

**Blocked by:** 01 — Expand continuum emission module

## Acceptance criteria

- [ ] Collection emits `checkArray` / element checks via continuum modes while retaining the element loop framing
- [ ] AnyShape emits `checkMulti` scaffolding locally and each arm via continuum checkMulti arm mode
- [ ] Nested abort vs parent-local soft-fail for collection multi-arm paths still matches ADR-0001
- [ ] Existing e2e Create soft-fail suite still passes

## Seams

| Seam | Depends on |
|------|------------|
| `Collection continuum emission` | `Continuum emission` |
| `Any continuum emission` | `Continuum emission` |
| `Soft-fail Create runtime` | `—` |

### Behaviors

- [ ] **Collection continuum emission**: Create early-return mode emits `checkArray` early-return then an element loop whose child checks use the continuum
- [ ] **Collection continuum emission**: checkMulti arm mode emits `checkArray` failure→`return false`, element checks with abort-on-nested-record-soft-fail, then `return true`
- [ ] **Collection continuum emission**: bare mode keeps array framing (`if (checkArray) { … }`) with continuum child checks inside
- [ ] **Any continuum emission**: Create early-return mode wraps `checkMulti([…])` with early-return and arms emitted as continuum checkMulti arms
- [ ] **Any continuum emission**: checkMulti arm mode returns the boolean result of nested `checkMulti` with continuum arms
- [ ] **Any continuum emission**: bare mode emits `checkMulti([…])` with continuum arms and no Create early-return wrapper
- [ ] **Soft-fail Create runtime**: existing e2e Create soft-fail suite still passes after Collection/Any migration

### Deliverables

- [ ] Collection/Any continuum branch templates removed where continuation now delegates to the continuum module

### Out of scope

- Leaf / Record continuum migration (other tickets)
- Moving Collection loops or Any `checkMulti([…])` scaffolding into the continuum module
- Continuum flag removal from the Shape interface
- Proxy Create body scaffolding

## Parent

[Create continuum emission module](../spec.md)
