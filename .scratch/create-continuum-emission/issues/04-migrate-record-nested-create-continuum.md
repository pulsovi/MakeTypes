# 04 — Migrate Record nested Create continuum
**Status:** open
**Triage:** ready-for-agent
**Labels:** `enhancement`

**What to build:** Record nested Create continuation (assign `Create` + `instanceof` / abort) goes through the continuum emission module’s Record modes — soft-fail Create behaviour unchanged; record/root Create body scaffolding stays put.

**Blocked by:** 01 — Expand continuum emission module

## Acceptance criteria

- [ ] Record `emitProxyTypeCheck` uses continuum Record nested Create modes for multi-arm and abort continuation
- [ ] Field checks from record Create still soft-fail via continuum Create early-return (directly or via migrated leaves)
- [ ] Existing e2e Create soft-fail suite still passes
- [ ] Record/root Proxy Create class scaffolding not rewritten as a Create-body module

## Seams

| Seam | Depends on |
|------|------------|
| `Record nested Create continuum` | `Continuum emission` |
| `Soft-fail Create runtime` | `—` |

### Behaviors

- [ ] **Record nested Create continuum**: checkMulti arm path emits continuum Record multi-arm motif (`Create` assign + `instanceof` boolean)
- [ ] **Record nested Create continuum**: abort path emits continuum Record abort motif (`Create` assign + early-return when not `instanceof`)
- [ ] **Record nested Create continuum**: parent Create path without abort leaves nested soft-fail local (no abort motif) *(covers ADR nested locality)*
- [ ] **Soft-fail Create runtime**: existing e2e Create soft-fail suite still passes after Record continuum migration

### Deliverables

- [ ] RecordShape continuum continuation for nested Create delegated to the continuum module

### Out of scope

- Collapsing record/root Create body (clone, unknown properties, `new Proxy`) into a Create-body emitter
- Continuum flag removal from the Shape interface (contract ticket)
- Leaf / Collection / Any migration (other tickets)

## Parent

[Create continuum emission module](../spec.md)
