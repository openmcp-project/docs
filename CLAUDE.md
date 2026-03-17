# CLAUDE.md - Open Control Plane Documentation

## About

**Open Control Plane** provides Infrastructure- and Configuration-as-Data capabilities via Kubernetes Resource Model APIs. Part of ApeiroRA (IPCEI-CIS European cloud initiative).

> **Note:** Legacy "openMCP" references should be updated to "Open Control Plane"

## Tech Stack

- **Docusaurus 3** (React-based docs)
- **TypeScript** + **MDX** 
- **Mermaid** diagrams
- **Node.js 18+**

## Brand Colors

**Teal Spectrum** (primary brand colors):
- **Teal 2** (lightest): `#C2FCEE` | RGB 194/252/238 | Pantone 317 C
- **Teal 4** (bright): `#2CE0BF` | RGB 44/224/191 | Pantone 3255 C  
- **Teal 6** (medium): `#049F9A` | RGB 4/159/154 | Pantone 2233 C
- **Teal 7** (darker): `#07838F` | RGB 7/131/143 | Pantone 2235 C
- **Teal 10** (dark): `#02414C` | RGB 2/65/76 | Pantone 2215 C
- **Teal 11** (darkest): `#012931` | RGB 1/41/49 | Pantone 2189 C

**Usage:**
- Use lighter teals (2, 4) for backgrounds and highlights
- Medium teals (6, 7) for primary actions and branding  
- Darker teals (10, 11) for text and contrast elements
- Consider gradients between adjacent teal shades

## Structure

```
docs/
├── about/          # Project overview, concepts, design
├── users/          # End-user guides  
├── operators/      # Platform operator docs
└── developers/     # Contributor/dev docs
adrs/               # Architectural Decision Records
templates/adr.*     # ADR template + script
```

## Commands

```bash
npm start           # Dev server (localhost:3000)
npm run build       # Production build
npm run new-adr     # Create new ADR
npm run typecheck   # TypeScript validation
```

## Core Concepts

- **Control Plane** - Kubernetes API server as a service
- **Service/Cluster Providers** - Entities offering services/clusters  
- **Platform Service** - Software/infrastructure via control plane
- **OCM** - Open Component Model integration

## Workflow

1. **Content** → Add to appropriate `docs/` subfolder
2. **ADRs** → Use `npm run new-adr`
3. **Test** → `npm run build` + `npm run typecheck`
4. **Deploy** → GitHub Pages on `main` branch push

## Writing Style

**Friendly but precise** - Be welcoming to newcomers while technically accurate for experts.

**Concise** - Respect readers' time. Get to the point quickly.

**Structure patterns:**
- Lead with **what** and **why** before **how**
- Use bullets and short paragraphs
- Include examples for every concept
- Link to related docs liberally

**Voice:**
- "You can..." not "One might..."  
- "This feature helps you..." not "This feature provides the capability to..."
- Active voice: "Install the CLI" not "The CLI should be installed"

**Technical precision:**
- Exact command syntax with copy-paste examples
- Specify prerequisites clearly
- Note version requirements
- Include common error solutions

## Sidebars

Auto-generated from directory structure. Control order with `sidebar_position` frontmatter.

---

*Update BACKLOG.md when tasks move. Test locally before committing.*