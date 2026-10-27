# Create continuum emission module
**Status:** open
**Triage:** ready-for-agent
**Labels:** `enhancement`

## Problem Statement

Changing Create soft-fail / union / nested-abort emission means editing the same branching in every Shape. The Create continuum continuation rules have no single home, so ADR soft-fail locality fails and agents bounce across many shallow `emitProxyTypeCheck` copies.

## Solution

Concentrate Create continuum continuation in one emission module. Shapes keep `emitProxyTypeCheck` as the polymorphic entry but only declare which check and which data; callers pass a closed continuum **mode**. Structural framing (collection loops, union `checkMulti` scaffolding) stays in those Shapes. Land expand → migrate → contract without changing runtime soft-fail behaviour.

PHILOSOPHY: `prefer-continuum-emission-locality` · PHILOSOPHY: `prefer-expand-contract-continuum-migrate` · see [Create continuum emission module](../../docs/adr/0002-create-continuum-emission-module.md) · soft-fail contract stays [Create soft-fail early-return](../../docs/adr/0001-create-soft-fail-early-return.md) · glossary [Create continuum](../../CONTEXT.md)

## User Stories

1. As a maintainer, I want Create continuum early-return emission in one module, so that soft-fail continuation changes land in one place.
2. As a maintainer, I want checkMulti arm emission in that same module, so that union branch success stays consistent with ADR-0001.
3. As a maintainer, I want bare check-call emission in that module, so that non-Create call sites share the same check emission path.
4. As a maintainer, I want Record nested Create continuation (assign Create + instanceof / abort) in that module, so that nested soft-fail policy is not a special case buried in RecordShape alone.
5. As a Shape author, I want `emitProxyTypeCheck` to remain the polymorphic entry, so that I do not learn a second Shape emission interface for this deepen.
6. As a Shape author, I want to declare only which check and which data/field, so that I do not reimplement continuum branching.
7. As a caller of `emitProxyTypeCheck`, I want to pass a closed continuum mode, so that I do not thread `earlyReturnVar` / `asCheckMultiArm` / `abortRecordSoftFail`.
8. As a caller, I want Create early-return mode to carry its return binding, so that root and record Create can soft-return the correct value.
9. As a Collection Shape maintainer, I want element-loop framing to stay in CollectionShape, so that the continuum module does not own array iteration.
10. As an AnyShape maintainer, I want `checkMulti([…])` scaffolding to stay in AnyShape, so that the continuum only emits each arm’s check continuation.
11. As an emission implementer, I want the continuum module to mark `check*` helpers when it emits those calls, so that Shapes stop stringly naming helpers for continuum calls.
12. As a tester, I want continuum emission asserted through a Writer, so that continuation motifs are proven without a full emit→transpile→import round-trip.
13. As a tester, I want existing e2e Create soft-fail tests to keep passing unchanged, so that ADR-0001 runtime behaviour is not regressed.
14. As a maintainer, I want the continuum module introduced beside the old flags first, so that expand does not break existing Shape call sites.
15. As a maintainer, I want Shape call sites migrated onto the continuum in batches, so that each batch can stay green.
16. As a maintainer, I want continuum flags removed from the Shape continuum interface only after migration, so that contract is a deliberate last step.
17. As an agent implementing a leaf Shape, I want primitive check emission to go through the continuum, so that String/Number/Boolean/Null/Never stop duplicating the same branches.
18. As an agent implementing Collection emission, I want child checks to invoke the continuum with the right mode, so that multi-arm abort vs parent-local nested soft-fail stays correct.
19. As an agent implementing Record field checks, I want field `emitProxyTypeCheck` calls to use Create early-return mode, so that record Create soft-fail still early-returns the input.
20. As an agent implementing root non-record Create, I want root checks to use Create early-return mode with the root return binding, so that root soft-fail matches record soft-fail policy.
21. As a future architecture reviewer, I want Proxy Create body scaffolding left out of this effort, so that continuum deepening is not blocked on record/root class emit collapse.
22. As a glossary reader, I want “Create continuum” to name the ordered emitted validation path, so that docs and tickets do not say “soft-fail flags” or “EmitProxyTypeCheckArgs”.
23. As a CI consumer, I want each expand/migrate/contract step to leave tests green, so that continuum migration does not require a single opaque mega-diff.
24. As a maintainer, I want no change to `handleProxyError` / systematic throw defaults, so that this effort stays emission-structure only.
25. As a maintainer, I want unknown-property Create handling left with record Create body work, so that this continuum module does not absorb Create scaffolding.

## Implementation Decisions

- Build one Create continuum emission module that owns continuation for the closed mode set: Create early-return (with return binding), checkMulti arm, bare call, and Record nested Create continuation (assign Create + instanceof / abort).
- Keep `Shape.emitProxyTypeCheck` as the polymorphic entry; each Shape delegates continuum continuation to that module and only supplies check identity plus data/field/`shouldThrow` (and related non-continuum args such as tab/indent/type as needed).
- Callers pass continuum **mode** instead of `earlyReturnVar` / `asCheckMultiArm` / `abortRecordSoftFail`; those flags leave the Shape continuum interface after contract.
- When the continuum emits a `check*` call, it marks that helper used; Shapes do not name helpers for those continuum calls.
- Collection element loops and AnyShape `checkMulti([…])` scaffolding stay in those Shapes; they call the continuum per check / arm.
- Runtime soft-fail behaviour remains ADR-0001; this effort does not reopen that ADR.
- Proxy Create body scaffolding (record/root class emit, clone, unknown-property scan, `new Proxy`) is out of this effort (candidate #2 / ADR-0002 scope note).
- Land via expand → migrate → contract per PHILOSOPHY: `prefer-expand-contract-continuum-migrate`.
- Domain term: Create continuum (see CONTEXT.md). Architectural authority: ADR-0002; soft-fail contract: ADR-0001.

## Testing Decisions

- Good tests assert observable continuum emission behaviour (what Writer output contains for a given mode/check) or ADR-0001 Create runtime behaviour — not private flag wiring or Shape method internals.
- Primary new seam: continuum emission module through Writer (`CbWriter`).
- Regression seam: existing e2e generated `Create` soft-fail tests (emit → transpile → import) must keep passing; they prove unchanged ADR-0001 behaviour, not continuum module structure.
- Prior art: soft-fail e2e under the create-soft-fail-early-return scratch lot; Writer adapters already used for emission sinks.

## Out of Scope

- Collapsing record/root Proxy Create body emission into a Create-body module (architecture candidate #2).
- Changing ADR-0001 soft-fail runtime semantics, `handleProxyError` shape, or making throwing the default again.
- Splitting Emitter session vs emission, absorbing `lib/types.ts`, or a typed shared runtime for `check*` bodies beyond what continuum emission already requires.
- Re-entering Create with an already-built Proxy that then soft-fails (still V1 out of scope from ADR-0001).

## Further Notes

- Seams for implementation tickets should prefer the continuum Writer seam for new continuum behaviours; use e2e Create only where the ticket claims an ADR-0001 runtime guarantee.
- Wide refactor: do not force flag deletion into the first vertical slice — expand first, migrate in batches, contract last.
