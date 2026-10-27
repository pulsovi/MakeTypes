## Agent skills

### Issue tracker

Issues and specs as local markdown under `.scratch/<feature>/`. Standard header `Status` · `Triage` · `Labels` · (`Delivered` | `Closed` if terminal). See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Issue labels

Optional business labels (`enhancement`, `bug`, `docs`, `infra`). See `docs/agents/issue-labels.md`.

### Issue closure

Closure protocol — terminal tickets carry `**Delivered:**` or `**Closed:**` (ISO date) in the header. See `docs/agents/issue-closure.md`.

### Domain docs

Single-context layout (`CONTEXT.md`, `PHILOSOPHY.md`, `docs/adr/`). See `docs/agents/domain.md`.

### Coding standards

Content language en; review rules under `docs/standards/`; IDE projections under `.cursor/rules/standards/` (`.mdc`). See `docs/agents/coding-standards.md`.

### Git

**Default branch:** `master`
