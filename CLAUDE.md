# CLAUDE.md — Project guidelines for Claude Code

## Document ID requirement

Every documentation page (`.md` / `.mdx` in `docs/`) **must** have an explicit `id:` in its frontmatter.

The `id:` field sets the document identifier, which Docusaurus uses to generate the URL. This keeps URLs tied to the folder structure while stripping numeric prefixes from filenames.

IDs must:
- Be the desired URL segment (without path prefix)
- Strip numeric filename prefixes (e.g. `01-setup.md` → `id: setup`)
- Use kebab-case

Example:
```md
---
sidebar_position: 1
id: setup
---
```

The resulting URL will be `/operators/setup` (folder path + id).

Pages without an `id:` field will use the filename as-is, including any numeric prefixes — always add one when creating or renaming a page.

### Avoiding breaking URLs

When changing an existing `id:`, you **must** add a redirect in `docusaurus.config.ts` to preserve the old URL:

```ts
plugins: [
  [
    '@docusaurus/plugin-client-redirects',
    {
      redirects: [
        {
          from: '/old/path',
          to: '/new/path',
        },
      ],
    },
  ],
],
```

This ensures external links and bookmarks continue to work after ID changes.

## Branch workflow

Work on feature branches based on `main`. Merge via PR.

## Stack

- Docusaurus 3 (MDX + React in `.mdx` files)
- Custom CSS variables in `src/css/custom.css`
