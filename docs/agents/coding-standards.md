# Coding Standards

How review and authoring skills consume this repo's coding standards.

## Before reviewing or authoring, read these

1. **This file** — contract fields, projection criteria.
2. **`docs/standards/README.md`** — topic index (created by `/write-coding-standards` on first topic).
3. **Topic files** listed in that index — load those relevant to the change under review (or the topic being edited).

If `docs/standards/` or the index is missing, **proceed silently** for review (smell baseline still applies). Do not block; do not insist on setup mid-review. For authoring, `/write-coding-standards` creates the body on first write.

## Layout

```
/
├── docs/
│   ├── agents/
│   │   └── coding-standards.md    ← this contract
│   └── standards/                 ← review rules (author via /write-coding-standards)
│       ├── README.md              ← index
│       ├── testing.md
│       └── …
├── .cursor/rules/standards/       ← IDE projections (subset of review rules)
│   ├── testing.reject-flaky.mdc
│   └── …
└── AGENTS.md                      ← one-liner under ## Agent skills
```

## Contract fields

- **Content-Language:** `en`
- **IDE-Rules-Path:** `.cursor/rules/standards/`
- **IDE-Rules-Extension:** `.mdc`

## Rule shape

Topics use stable rule ids, severity (`hard` | `judgment`), a checkable violation line, and an optional **Fix** line. Rules that carry an IDE projection note it via `ide-projection: <path>`. Authored via `/write-coding-standards` (see that skill's `RULE-FORMAT.md`).

## IDE projection

Some review rules also earn an **IDE projection** — a file in `IDE-Rules-Path` that the IDE loads automatically during coding. The projection rewrites the rule as a positive instruction; the review rule stays the single source of truth (id, severity, violation-when).

### Projection criteria

A rule earns a projection when it is:

1. **Routine** — applies routinely, not only in rare or architectural cases
2. **Direct** — the agent can follow it without reading surrounding context or diff
3. **Positive** — formulable as an instruction to follow, not a smell to detect

When `/write-coding-standards` drafts a rule, the agent judges projection against these three criteria, states its reasoning in one line, and asks the user to confirm or decline.

## Authoring

- Add or update topics with `/write-coding-standards`
- Re-run `/setup-repo` only to change content language, IDE-Rules-Path, or IDE-Rules-Extension
