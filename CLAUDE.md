# CLAUDE.md - Open Control Plane Documentation

## About

**Open Control Plane** provides Infrastructure- and Configuration-as-Data capabilities via Kubernetes Resource Model APIs. Part of ApeiroRA (IPCEI-CIS European cloud initiative).

> **Note:** Legacy "openMCP" references should be updated to "Open Control Plane"

## Tech Stack

- **Docusaurus 3** (React-based docs)
- **TypeScript** + **MDX** 
- **Mermaid** diagrams
- **Node.js 18+**

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