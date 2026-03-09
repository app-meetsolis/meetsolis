# Project Vocabulary

## Domain Terms
- **Client** — an executive coaching client (NOT a customer/user)
- **Session** — a coaching session meeting
- **Solis** — the AI coach assistant/panel
- **Intelligence** — the AI insights section of the app
- **Manual Notes** — coach's freeform notes about a client (Story 2.7)
- **Goal** — client's primary coaching goal (replaces old tags/status system)

## Codebase Terms
- **Story** — a BMad development story (e.g., "Story 2.7")
- **Epic** — a group of related stories (e.g., "Epic 2 — Client Card System")
- **QA Gate** — the YAML file that records QA review result (PASS/FAIL/CONCERNS)
- **Dev Agent Record** — section added to story file after implementation listing files changed
- **(dashboard) route group** — the `(dashboard)` folder in app router; doesn't add to URL path

## File Naming
- Stories: `docs/stories/{epic}.{story}.story.md`
- QA Gates: `docs/qa/gates/{epic}.{story}-{slug}.yml`
- Branches: `story/{epic}.{story}-{short-slug}`
- Plans: `docs/plans/{epic}.{story}-{slug}.md`
