# Issue Labels

Optional business tags recorded in the `**Labels:**` line at the top of each issue or spec file. Unlike triage roles, these labels persist after closure.

| Label | Meaning |
| ----- | ------- |
| `enhancement` | New capability or improvement |
| `bug` | Incorrect behavior fix |
| `docs` | Documentation, README, ADR |
| `infra` | Tooling, CI, harness, monorepo config |

Multiple labels are separated by ` · ` (e.g. `` `enhancement` · `infra` ``).

When a skill creates a ticket, apply relevant labels from this table. Add new labels here before using them in tickets.

Coordination across a feature lot belongs in the feature spec (`.scratch/<feature-slug>/spec.md`), not in an `epic` label.
