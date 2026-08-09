---
name: pokeapi-list
description: Use when working on the pokeapi-list project (Pokédex app). Covers the Nuxt 4 project structure, SCSS conventions (variables and responsive mixins in app/assets/scss), i18n setup, Pinia store, Cypress testing, English-only naming, and commands. Trigger when creating, editing, or extending components, pages, styles, translations, or tests in this repo.
---

# pokeapi-list — Project Guide

Pokédex app (technical test) built with **Nuxt 4**, Vue 3 + TypeScript, Pinia, SCSS, `@nuxtjs/i18n`, `@nuxt/icon`, and Cypress.

## Golden rules

- **All file and folder names are in English** (kebab-case). Even when the user talks about "favoritos" or "regiones", files stay `favorites.vue` / `regions.vue` unless the user explicitly changes convention.
- **All styles live in `app/assets/scss`** as global partials (one per component under `components/`, one per page under `pages/`). SFCs use global classes; scoped styles are the exception, and may use `$variables`/mixins because they are auto-injected via `vite.css.preprocessorOptions.scss.additionalData`.
- **All user-facing text goes through i18n** (`$t` / `useI18n`). Never hardcode UI strings.
- Prefer Nuxt auto-imports (composables, components, utils, stores) over manual imports.
- Keep to KISS / DRY / SOLID. Small focused components, no over-engineering.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run typecheck` | Vue/TS type check |
| `npm run test:e2e` | Cypress E2E (dev server must be running) |
| `npm run test:component` | Cypress component tests |
| `npm run test:open` | Cypress interactive runner |

## Directory structure

```
app/
├─ assets/scss/            → ALL global SCSS (see SCSS conventions)
│  ├─ main.scss            → entry, @use of every partial (registered in nuxt.config css)
│  ├─ _variables.scss      → design tokens: $color-*, $spacing-*, $font-*, $radius-*, $breakpoints
│  ├─ _mixins.scss         → respond-to() responsive mixin, flex/grid helpers, etc.
│  ├─ _base.scss           → reset + global primitives (.button, .sr-only)
│  ├─ components/          → one partial per component (e.g. _pokeball-loader.scss)
│  └─ pages/               → one partial per page (e.g. _splash.scss, _onboarding.scss)
├─ components/ui/          → reusable UI components (PokeballLoader, AppFooterNav); no prefix via components.pathPrefix: false
├─ composables/            → useFirstTime.ts etc.
├─ layouts/                → main.vue (footer navigation + <slot />)
├─ locales/                → es.json, en.json (translation files)
├─ pages/                  → index (splash), onboarding, pokedex, regions, favorites, profile
├─ plugins/                → favorites-persist.client.ts (localStorage persistence)
├─ stores/                 → favorites.ts (Pinia)
├─ utils/                  → constants.ts, formatters, api clients
└─ app.vue                 → <NuxtLayout><NuxtPage /></NuxtLayout> (layouts applied)
cypress/
├─ e2e/                    → full flows (onboarding, navigation, favorites persistence)
├─ component/              → isolated component tests (presentational components only)
└─ support/
```

## Routing & flow

- `/` (pages/index.vue) → splash (PokeballLoader animation) → `/onboarding` (first visit only) or `/pokedex`.
- `/onboarding` → sets `useFirstTime()` flag (localStorage `pokeapi:first-time`) → `/pokedex`.
- `/pokedex`, `/regions`, `/favorites`, `/profile` use `layouts/main.vue` (footer with 4 tabs, active state by route path). Page files are in English (regions.vue, favorites.vue, profile.vue) — the Spanish labels come from i18n, never from file names.
- Footer tabs: `AppFooterNav.vue` receives `items` (label key, route, icon name) and `currentPath`.

## SCSS conventions

- Variables: `$color-white: #FFFFFF` style tokens in `_variables.scss`. Prefix groups: `$color-`, `$spacing-`, `$font-`, `$radius-`, `$z-`, `$transition-`, `$type-` (Pokémon type colors).
- Responsive: `@include respond-to('md') { ... }` (mobile-first). Breakpoints: `xs 0, sm 576, md 768, lg 992, xl 1200`.
- New component/page style → create partial `assets/scss/components/_name.scss` (or `pages/_name.scss`), `@use` its dependencies, and add a `@use` line to `main.scss`.
- Partial naming: `_` prefix (never compiled standalone). Kebab-case names matching the component.
- SFC scoped styles already have `_variables` and `_mixins` injected (additionalData) — use tokens directly.

## i18n

- Module `@nuxtjs/i18n` v10, `restructureDir: 'app'`, `langDir: 'locales'`, `strategy: 'no_prefix'`, `defaultLocale: 'es'`, lazy loading.
- Add new keys to **both** `app/locales/es.json` and `en.json` (Spanish first, since it's the default).
- Keys are nested (e.g. `pages.favorites.count` with named interpolation `{count}`).
- Use `$t('key.path')` in templates, `useI18n()` for programmatic access. Locale switch: `setLocale(code)`.

## State (Pinia)

- `stores/favorites.ts` — `pokemonNames: string[]` + getters `count`, `isFavorite(name)` + actions `add/remove/toggle` (normalizes to lowercase) + `hydrate()/persist()`.
- Persistence: `app/plugins/favorites-persist.client.ts` (client-only) hydrates on boot and writes `pokeapi:favorites` to localStorage via `$subscribe`.
- Other localStorage key: `pokeapi:first-time` (onboarding flag in `composables/useFirstTime.ts`).

## Testing (Cypress)

- **Cypress 15** — required for this stack: Nuxt 4.5 uses Vite 8, which Cypress 14 cannot load (`ERR_REQUIRE_ESM`). E2E and component tests both run under Cypress 15.
- E2E (`cypress/e2e/`) covers: splash redirect, onboarding, footer navigation, favorites persistence, i18n switch. Requires `npm run dev` first.
- **Hydration race**: in dev, the SSR HTML renders instantly but Vue hydrates ~2-4s later (Vite on-demand compilation). Clicks before hydration are silently lost. **Always call `cy.waitForHydration()` right after `cy.visit()`** (custom command in `cypress/support/commands.ts` that polls `#__nuxt.__vue_app__`; 15s cap). `defaultCommandTimeout` is 10s.
- Component (`cypress/component/`) covers presentational components only (e.g. PokeballLoader) — Nuxt auto-imports are NOT available in the component runner, so components with `$t`, `useRoute`, `NuxtLink`, `Icon` are tested via E2E instead.
- `vite.config.ts` at the repo root exists **only** for the Cypress component runner (Vue plugin); Nuxt 4 ignores it (`nuxt.config.ts` is the only config Nuxt reads). Component runner files: `cypress/support/component.ts` (imports `main.scss`) + `cypress/support/component-index.html`.
- Use `data-testid` attributes for stable selectors.

## Roadmap

- PokeAPI integration: `GET /api/v2/pokemon` (paginated list) + `GET /api/v2/pokemon/{name}` (detail). Plan: infinite scroll with IntersectionObserver, per-page parallel detail fetch, in-memory `Map` cache, share button via `navigator.clipboard` (name + attributes comma-separated).
- Design (Figma) is applied by the user — keep components functional and visually neutral.
