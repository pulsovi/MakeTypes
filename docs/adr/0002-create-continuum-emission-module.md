# Create continuum emission module

Continuation rules for the Create continuum (early-return on soft-fail, checkMulti boolean arms, nested-record abort) are concentrated in one emission module rather than reimplemented across every Shape. Shape subclasses declare which check and which data; they do not own continuum branching. This deepens emission structure only — runtime soft-fail behaviour stays as in ADR-0001. Proxy Create body scaffolding (record/root class emit) is deliberately out of this decision's scope.

`Shape.emitProxyTypeCheck` remains the polymorphic entry: each Shape delegates continuation to that module. Callers pass a closed **mode** (Create early-return with its return binding, checkMulti arm, bare call, Record nested Create + `instanceof` / abort) instead of `earlyReturnVar` / `asCheckMultiArm` / `abortRecordSoftFail`; those flags leave the Shape continuum interface. When it emits a `check*` call, the continuum module marks the helper used; Shapes no longer name helpers for those calls.

Structural framing that is not check-continuation — Collection element loops, AnyShape `checkMulti([…])` scaffolding — stays in those Shapes; they invoke the continuum for each check / arm. Tests: continuum emission via Writer (`CbWriter`); ADR-0001 soft-fail behaviour via existing e2e `Create` tests.

Land via expand → migrate → contract: add the continuum module beside the flags, move Shape call sites over, then delete the old continuum flags from the Shape interface.
