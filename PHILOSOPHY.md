# Philosophy

Heuristics for choosing among implementation options that are all valid.

## Principles

### `prefer-continuum-emission-locality`

**Prefer:** concentrating Create continuum continuation (early-return, checkMulti arms, nested abort) behind one emission module
**When:** Soft-fail / union / nested-abort rules would otherwise be reimplemented in every Shape's `emitProxyTypeCheck`
**Why:** ADR soft-fail rules need one home; Shape subclasses should declare which check, not how the continuum continues. Locality beats polymorphic copies of the same flags.
_See also:_ ADR-0002, CONTEXT: Create continuum

### `prefer-expand-contract-continuum-migrate`

**Prefer:** expand (new continuum module beside old flags) → migrate Shape call sites → contract (delete continuum flags)
**When:** replacing Create continuum branching across many Shapes with one emission module
**Why:** Each step can stay green; a big-bang swap couples every Shape failure to one opaque diff.
_See also:_ ADR-0002
