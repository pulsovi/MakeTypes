# 02 — Migrate leaf Shape continuum emission
**Status:** open
**Triage:** ready-for-agent
**Labels:** `enhancement`

**What to build:** Leaf Shapes (string, number, boolean, null, never) delegate Create continuum continuation to the continuum emission module so their `emitProxyTypeCheck` no longer owns early-return / multi-arm / bare branching — soft-fail Create behaviour unchanged.

**Blocked by:** 01 — Expand continuum emission module

## Acceptance criteria

- [ ] Leaf `emitProxyTypeCheck` paths emit continuum continuation via the continuum module for Create early-return, checkMulti arm, and bare modes
- [ ] Leaf Shapes no longer duplicate continuum branch templates for those modes
- [ ] Existing e2e Create soft-fail suite still passes

## Seams

| Seam | Depends on |
|------|------------|
| `Leaf emitProxyTypeCheck` | `Continuum emission` |
| `Soft-fail Create runtime` | `—` |

### Behaviors

- [ ] **Leaf emitProxyTypeCheck**: Create early-return mode for a leaf emits the continuum early-return motif (cases: string, number, boolean, null, never)
- [ ] **Leaf emitProxyTypeCheck**: checkMulti arm mode for a leaf emits the continuum multi-arm motif (cases: string, number, boolean, null, never)
- [ ] **Leaf emitProxyTypeCheck**: bare mode for a leaf emits the continuum bare `check*` motif (cases: string, number, boolean, null, never)
- [ ] **Soft-fail Create runtime**: existing e2e Create soft-fail suite still passes after leaf migration

### Deliverables

- [ ] Leaf Shape continuum branching removed in favour of continuum module delegation

### Out of scope

- Collection / Any / Record continuum migration
- Continuum flag removal from the Shape interface (contract ticket)
- Proxy Create body scaffolding

## Parent

[Create continuum emission module](../spec.md)
