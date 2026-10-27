# 05 — Contract continuum flags → mode interface
**Status:** open
**Triage:** ready-for-agent
**Labels:** `enhancement`

**What to build:** Callers pass a closed continuum **mode** into `emitProxyTypeCheck`; `earlyReturnVar` / `asCheckMultiArm` / `abortRecordSoftFail` leave the Shape continuum interface — soft-fail Create behaviour unchanged.

**Blocked by:** 02 — Migrate leaf Shape continuum emission; 03 — Migrate Collection & Any continuum emission; 04 — Migrate Record nested Create continuum

## Acceptance criteria

- [ ] Continuum callers (record Create fields, root Create, Collection children, Any arms) pass continuum mode rather than the three continuum flags
- [ ] Those continuum flags are removed from the Shape continuum interface
- [ ] Existing e2e Create soft-fail suite still passes

## Seams

| Seam | Depends on |
|------|------------|
| `Continuum mode interface` | `Continuum emission` |
| `Soft-fail Create runtime` | `—` |

### Behaviors

- [ ] **Continuum mode interface**: record Create field checks are invoked with Create early-return mode (return binding for the record input)
- [ ] **Continuum mode interface**: root non-record Create checks are invoked with Create early-return mode (root return binding)
- [ ] **Continuum mode interface**: Collection child checks pass the continuum mode required for Create early-return vs multi-arm abort
- [ ] **Continuum mode interface**: AnyShape arms are invoked with checkMulti arm mode
- [ ] **Continuum mode interface**: Shape continuum interface no longer accepts `earlyReturnVar` / `asCheckMultiArm` / `abortRecordSoftFail` *(non-testable)*
- [ ] **Soft-fail Create runtime**: existing e2e Create soft-fail suite still passes after contract

### Deliverables

- [ ] Continuum flags deleted from the Shape continuum interface; callers updated to modes

### Out of scope

- Further deepening of Proxy Create body emission
- Changing ADR-0001 runtime semantics

## Parent

[Create continuum emission module](../spec.md)
