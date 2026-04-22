# CLAUDE.md — Project guidelines for Claude Code

## Slug requirement

Every documentation page (`.md` / `.mdx` in `docs/`) **must** have an explicit `slug:` in its frontmatter.

Slugs must:
- Start with `/` and mirror the logical URL path (e.g. `/operators/setup`)
- Strip numeric filename prefixes (e.g. `01-setup.md` → `/operators/setup`)
- Use kebab-case

Example:
```md
---
sidebar_position: 1
slug: /operators/setup
---
```

Pages without a `slug:` field will produce non-deterministic URLs if files are renamed or reordered — always add one when creating or renaming a page.

## Branch workflow

Work on feature branches based on `main`. Merge via PR.

## Stack

- Docusaurus 3 (MDX + React in `.mdx` files)
- Custom CSS variables in `src/css/custom.css`
- Brand teal palette: `--teal-2` through `--teal-11` (see `docs/developers/branding.mdx`)
