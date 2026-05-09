# Backlog

Future items that are non-blocking but should be addressed before launch or in the next sprint.

## File Format

Each file is named by date + time: `YYYY-MM-DD-HH-MM.md`

Every file contains:

```
status: pending | done
date: YYYY-MM-DD HH:MM
source: where this came from (e.g. QA gate 5.3, manual review)

## Items

- [ ] description of what to do
- [ ] description of what to do
```

## Rules

- One file per session/source (don't create a new file for every item — group by date/session)
- Mark `[x]` when done, update `status: done` when all items in the file are complete
- When implementing a backlog item, reference the file in the PR description
