# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nuxt 4 + Nuxt UI v4 template for building webpages. German-language target (`lang="de"`). Uses pnpm as the package manager.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server on http://localhost:3000
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm typecheck        # Type-check (runs nuxt prepare first)
```

## Architecture

- **Nuxt 4** with app directory structure (`app/` contains pages, layouts, components, composables, etc.)
- **Nuxt UI v4** — component library built on Tailwind CSS v4. Use `<U*>` components (e.g. `<UButton>`, `<UCard>`). Wrap the app root with `<UApp>`.
- **Pinia** for state management (`@pinia/nuxt`)
- **@nuxt/fonts** for automatic font loading (Inter as default sans font)
- **@nuxt/a11y** for accessibility checks
- **Lucide** icon set (`@iconify-json/lucide`) — use via Nuxt UI's icon prop

## Styling

- Tailwind CSS v4 — imported via `@import 'tailwindcss'` and `@import '@nuxt/ui'` in `app/assets/css/main.css`
- Theme tokens defined in `@theme static` block in `main.css` (neutral color palette, font family)
- UI colors configured in `app/app.config.ts` (primary: blue, secondary: slate, neutral: neutral)

## Code Style & Linting

- **Always run `pnpm lint:fix` first** when encountering lint errors — most issues (key ordering, formatting, imports) are auto-fixable
- ESLint with **@antfu/eslint-config** integrated via `@nuxt/eslint` module
- Formatting handled by ESLint (no Prettier) — 2-space indent, single quotes, semicolons
- `type` keyword preferred over `interface` (`ts/consistent-type-definitions: ['error', 'type']`)
- Imports auto-sorted by `perfectionist/sort-imports`
- Direct `process.env` access disallowed (`n/no-process-env: error`) — use `useRuntimeConfig()` instead
- Filenames must be camelCase, kebab-case, or PascalCase
- pnpm settings go in `pnpm-workspace.yaml`, not in `package.json` (enforced by `pnpm/json-prefer-workspace-settings` rule)
- YAML and JSON keys must be sorted alphabetically (enforced by `yaml/sort-keys` and `jsonc/sort-keys`)

## Git Hooks

- **Husky** pre-commit hook runs **lint-staged**, which auto-fixes ESLint on `*.{js,ts,mjs,cjs,vue}` files before commit
