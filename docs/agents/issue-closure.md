# Issue Closure

How to close markdown tickets in `.scratch/`. Applies to implementation issues and specs.

## Status values

| Status | Meaning |
| ------ | ------- |
| `open` | Not started or in progress with no partial delivery yet |
| `partial` | Work delivered but acceptance criteria not fully met, or scope deferred to another issue |
| `delivered` | Terminal — all acceptance criteria met |
| `wontfix` | Terminal — will not be actioned |

During triage, the `**Triage:**` line holds the active workflow role (see `triage-labels.md`). On terminal closure (`delivered` or `wontfix`), remove the `**Triage:**` line. Keep `**Labels:**` unchanged.

## Close as `delivered`

1. Every item under *Acceptance criteria* is checked `[x]`
2. Set `**Status:** delivered`
3. Set `**Delivered:** YYYY-MM-DD` (closure date) — **required** in the header
4. Remove `**Triage:**`
5. Append a dated entry under `## Comments`:

    **YYYY-MM-DD — Delivered**
    <What was implemented and which validations were run, e.g. `yarn test`, `yarn build`.>
    <Optional: out-of-scope items explicitly deferred to another issue, with path.>

The comment date and `**Delivered:**` must match.

An agent may close a ticket as `delivered` when the criteria above are met.

## Close as `wontfix`

1. Set `**Status:** wontfix`
2. Set `**Closed:** YYYY-MM-DD` (closure date) — **required** in the header
3. Remove `**Triage:**`
4. Append a dated entry under `## Comments`:

    **YYYY-MM-DD — Wontfix**
    <Reason the ticket will not be actioned.>

5. For **enhancements** rejected as out of scope, follow the `triage` skill flow (`.out-of-scope/` file, link from the comment)

The comment date and `**Closed:**` must match.

The triage skill speaks in terms of the `wontfix` triage role during evaluation; at closure, translate that to `**Status:** wontfix`.

## Spec closure

A feature spec (`.scratch/<feature-slug>/spec.md`) follows the same header and closure protocol. Set `Status: delivered` + `**Delivered:**` when all child implementation issues under `.scratch/<feature-slug>/issues/` are `delivered` or `wontfix`.

## Partial delivery

When meaningful work ships but the ticket is not closable:

- Set `**Status:** partial`
- Leave or update `**Triage:**` as appropriate
- Document what was delivered and what blocks closure (deferred criteria, linked child issue)

Do not use `partial` as a permanent substitute for splitting scope — open a follow-up issue when deferring work.

## Arbitration

See `issue-tracker.md` § resolving divergent information — `**Delivered:**` / `**Closed:**` dates decide which frozen brief wins.
