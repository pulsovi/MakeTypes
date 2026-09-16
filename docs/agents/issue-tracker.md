# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` — never a single combined tickets file
- Triage state is recorded as a `Triage:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Durable linking

Tracker content outlives edits. Cite authorities without line numbers or heading anchors — preview breaks on `#`.

- **Markdown link** — file path only (`[label](./path/to/doc.md)`). No `:start-end`, `#Lnn`, or `#heading`.
- **Named token** — `` PHILOSOPHY: `id` `` for principles (see `domain.md`).
- **Textual reference** — `` `path/to/doc.md` § Section name `` or a defined term in backticks when the path alone is enough context.

## Standard header

Issues and specs share the same header at the top of the file:

```
# Title
**Status:** open
**Triage:** ready-for-agent
**Labels:** `enhancement`
```

Delivered ticket:

```
# Title
**Status:** delivered
**Delivered:** 2026-07-19
**Labels:** `enhancement`
```

| Line | Role | Reference |
| ---- | ---- | --------- |
| `**Status:**` | Lifecycle (`open`, `partial`, `delivered`, `wontfix`) | `issue-closure.md` |
| `**Triage:**` | Active triage role (one only) — absent when terminal | `triage-labels.md` |
| `**Delivered:**` | ISO delivery date (`YYYY-MM-DD`) — **required** when `Status: delivered` | `issue-closure.md` |
| `**Closed:**` | ISO close date — **required** when `Status: wontfix` | `issue-closure.md` |
| `**Labels:**` | Optional business tags (persist after closure) | `issue-labels.md` |
| `**Type:**` | Wayfinding ticket type (`research`/`prototype`/`grilling`/`task`) — maps only | Wayfinding operations |
| `**Claimed:**` | Wayfinding claim marker — maps only; never reuse `**Status:**` for claim | Wayfinding operations |

- New ticket: `Status: open`; `Triage` per initial role (often `needs-triage`); `Labels` if relevant
- Ticket in progress with incomplete scope: `Status: partial`
- Terminal `delivered`: `Status: delivered` + `**Delivered:** YYYY-MM-DD` — remove `**Triage:**`
- Terminal `wontfix`: `Status: wontfix` + `**Closed:** YYYY-MM-DD` — remove `**Triage:**`

## Resolving divergent information

When two sources (issues, briefs, comments) conflict:

1. Prefer the source with the latest close date (`**Delivered:**` or `**Closed:**`)
2. On equal dates, prefer living ADR / `CONTEXT.md` over a frozen issue brief
3. A more recently updated `open` / `partial` ticket (dated grill comment) beats an older `delivered` ticket when the grill explicitly superseded a decision

Do not rewrite historical `delivered` briefs just to modernize vocabulary — the header date is enough to rank them as older.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed). Pick the next available number in that directory. Apply the standard header.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `.scratch/<effort>/map.md` — the Notes / Decisions-so-far / Fog body.
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body. Use the standard header. A `**Type:**` line records the ticket type (`research`/`prototype`/`grilling`/`task`). Lifecycle stays on `**Status:**` (`open` while live); triage role on `**Triage:**` as usual.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it lists is terminal (`delivered` or `wontfix`).
- **Frontier**: scan `.scratch/<effort>/issues/` for files that are `Status: open` (or `partial`), unblocked, and unclaimed; first by number wins.
- **Claim**: set `**Claimed:**` to the driving session (or `@me`) and save before any work — do **not** overload `**Status:**` for claim state.
- **Resolve**: append the answer under an `## Answer` heading, close per `issue-closure.md` as `delivered` (set `**Delivered:**`, remove `**Triage:**` and `**Claimed:**`), then append a context pointer (gist + link) to the map's Decisions-so-far in `map.md`.
