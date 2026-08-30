# Ali Babaei — Design decisions your team can ship

Faithful, responsive self-hosted recreation of the supplied reference page.

## Local development

```bash
npm ci
npm run dev
```

## GitHub Pages

1. Create a repository in your GitHub account and push this project to the `main` branch.
2. In the repository settings, open **Pages** and set the source to **GitHub Actions**.
3. The included workflow builds and deploys the site on every push to `main`.

The Vite base path is relative so the site works both at a repository subpath and on a custom domain.

## Design system

- [Design System contract](docs/design-system.md) — tokens, typography, spacing, grid, color, effects, motion, accessibility, and change rules.
- [Site Content Model](docs/site-content-model.md) — page roles, semantic content entities, section meaning, and the mapping from content to visual modules.
- `src/design-tokens.css` — the implementation-level token source of truth.
