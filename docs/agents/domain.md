# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`PHILOSOPHY.md`** at the repo root — Prefer/When/Why heuristics for open design forks.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. In multi-context repos, also check `src/<context>/docs/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs`, `/modeling-batch-grill`, and `/improve-codebase-architecture`) creates or fills them lazily when terms, decisions, or philosophy-gate-passed principles actually get resolved.

## File structure

Single-context repo (most repos):

```
/
├── CONTEXT.md
├── PHILOSOPHY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root; `PHILOSOPHY.md` stays root-only in V1):

```
/
├── CONTEXT-MAP.md
├── PHILOSOPHY.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Cite in Cursor chat

_Chat only._ Issue and spec files follow `issue-tracker.md` § Durable linking — not line ranges, not `#heading` anchors.

An **in-sentence** pointer to an authority silo (a `CONTEXT.md` term, a `PHILOSOPHY.md` id, an ADR, or a coding-standard rule) is a markdown link inserted in the sentence. Label = the unit's name. Target = `path:start-end`, resolved at cite time, covering that unit's block. Cursor local links require a `/` in the path.

**Single-root window:** paths are relative to that root. Root files **must** be prefixed with `./`:

```md
This contradicts [prefer-explicit-seams](./PHILOSOPHY.md:14-22) because a hidden seam was the other valid path.
```

**Multi-root window:** identical filenames exist across folders. The first path segment **must** be the workspace folder name (`<workspace-folder>/<path-from-that-root>:start-end`). Do not use `./file.md` or `c:\…` paths — they are ambiguous or not clickable. If the project documents the folder names (typically `AGENTS.md` / `docs/agents/domain.md`), use those names.

The first time this Cursor thread uses a `CONTEXT.md` term, that occurrence is the link; later uses in the same thread stay plain unless you point at the definition again.

When a Maintainer instruction contradicts a coding standard, surface it as an in-sentence pointer to that rule's `Violation when:` block. Code-hunk accusations stay with `/disposition-grill`'s fence.

## Cite philosophy in issues

When a principle applies, put `` PHILOSOPHY: `id` `` in the issue or agent brief. Include applicable philosophy guidance in the issue. For other authorities, use a path-only markdown link or a textual reference (` § Section`) — see `issue-tracker.md` § Durable linking.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it with a path-only link or `` `docs/adr/….md` § title `` rather than silently overriding — and say why it's worth reopening.

## Flag philosophy conflicts

If your output contradicts an existing principle, surface it with `` PHILOSOPHY: `id` `` or `` `PHILOSOPHY.md` § `id` ``.
