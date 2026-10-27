# 01 — Expand continuum emission module
**Status:** open
**Triage:** ready-for-agent
**Labels:** `enhancement`

**What to build:** A Create continuum emission module that can emit the closed mode set (Create early-return with return binding, checkMulti arm, bare call, Record nested Create + instanceof / abort), with helpers marked when `check*` calls are emitted — while existing Shape flag-based paths remain untouched and soft-fail Create behaviour stays green.

**Blocked by:** None — can start immediately.

## Acceptance criteria

- [ ] Continuum module emits Create early-return, checkMulti arm, bare, and Record nested Create continuation modes
- [ ] Emitting a `check*` via the continuum marks that helper used
- [ ] Existing Shape continuum flags / call sites unchanged in this ticket
- [ ] Existing e2e Create soft-fail suite still passes

## Seams

| Seam | Depends on |
|------|------------|
| `Continuum emission` | `—` |
| `Soft-fail Create runtime` | `—` |

### Behaviors

- [ ] **Continuum emission**: Create early-return mode emits a failed-check early-return using the given return binding (cases: `checkString`, `checkNumber`, `checkBoolean`, `checkNull`, `checkNever`)
- [ ] **Continuum emission**: checkMulti arm mode emits boolean branch success via `return check*(…)` (cases: same primitive helpers)
- [ ] **Continuum emission**: bare mode emits a `check*` call without Create early-return or multi-arm wrapping
- [ ] **Continuum emission**: Record nested Create multi-arm mode emits assign-`Create` then `return dataVar instanceof ProxyClass`
- [ ] **Continuum emission**: Record nested Create abort mode emits assign-`Create` then early-return when not `instanceof` ProxyClass
- [ ] **Continuum emission**: emitting a `check*` marks that helper as used on the emission session
- [ ] **Soft-fail Create runtime**: existing e2e Create soft-fail suite still passes after expand

### Deliverables

- [ ] Continuum emission module available beside existing Shape flag paths (no caller migration yet)

### Out of scope

- Migrating any Shape `emitProxyTypeCheck` onto the continuum
- Removing continuum flags from the Shape interface
- Proxy Create body scaffolding (record/root class emit)

## Parent

[Create continuum emission module](../spec.md)
