# pokeapi-list

Pokédex app — technical test (Front End Developer). Built with **Nuxt 4** (Vue 3 + TypeScript).

## Tech stack & decisions

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | **Nuxt 4** (Vue 3, Composition API, TS) | Modern, file-based routing, auto-imports, official `app/` structure |
| State | **Pinia** | Official Vue store; favorites are persisted in the store (per test spec) |
| Persistence | `localStorage` via client plugin | Favorites survive reloads without a backend (KISS) |
| Styles | **SCSS** (`sass`, modern-compiler) | Design tokens (`$color-*`, `$spacing-*`...), responsive `respond-to()` mixin, one partial per component/page under `app/assets/scss/` |
| i18n | **`@nuxtjs/i18n` v10** | ES/EN with lazy loading; no URL prefix |
| Icons | **`@nuxt/icon`** (Iconify) | Material Symbols for the footer nav |
| Tests | **Cypress 15** (E2E + Component) | Single tool for full flows and isolated components; v15 required for Vite 8 (Nuxt 4.5) |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you land on the splash screen and, on first visit, the onboarding.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm run generate` | Static generation |
| `npm run typecheck` | TypeScript/Vue type check |
| `npm run test:e2e` | Cypress E2E (run `npm run dev` first) |
| `npm run test:component` | Cypress component tests (uses `cypress.vite.config.ts`, kept out of Nuxt's root) |
| `npm run test:open` | Cypress interactive runner |

## Project structure

```
app/
├─ assets/scss/            → all global SCSS (tokens, mixins, base + one partial per component/page)
├─ components/ui/          → PokeballLoader, AppFooterNav
├─ composables/            → useFirstTime (onboarding flag)
├─ layouts/                → main.vue (footer with 4 tabs)
├─ locales/                → es.json / en.json (translations)
├─ pages/                  → index (splash), onboarding, pokedex, regions, favorites, profile
├─ plugins/                → favorites-persist.client.ts
├─ stores/                 → favorites (Pinia)
├─ utils/                  → constants (storage keys)
└─ app.vue                 → NuxtLayout + NuxtPage
cypress/
├─ e2e/                    → splash/onboarding flow, footer navigation, favorites persistence, i18n
├─ component/              → PokeballLoader
└─ support/
```

## Architecture notes

- **Pages & flow**: `/` (splash) → `/onboarding` (first visit, flag in `localStorage`) → `/pokedex`. The four main sections (Pokédex, Regiones, Favoritos, Perfil) share `layouts/main.vue` with a fixed footer nav. Page files are in English (`regions.vue`, `favorites.vue`, `profile.vue`); Spanish labels come from i18n.
- **Naming**: all files and folders in English, kebab-case.
- **Styles**: all styling is centralized in `app/assets/scss` — variables and mixins are injected into SFC scoped styles automatically (`vite.css.preprocessorOptions.scss.additionalData`).
- **Components**: `components/` subfolders do not prefix component names (`components.pathPrefix: false`), so `<PokeballLoader>` / `<AppFooterNav>` resolve directly.
- **Favorites**: `stores/favorites.ts` normalizes names to lowercase; `plugins/favorites-persist.client.ts` hydrates from and persists to `localStorage` (`pokeapi:favorites`).
- **Scalability**: the PokeAPI list is paginated (~1300 Pokémon). Planned approach: infinite scroll via `IntersectionObserver` (20/page), parallel detail fetches per page cached in an in-memory `Map`, so favorites/search never refetch.
- **Agent reference**: `.opencode/skills/pokeapi-list/SKILL.md` documents the project for AI agents (structure, conventions, commands).

## Roadmap

- [ ] PokeAPI integration: list + details (infinite scroll, cache, search)
- [ ] Favorites UI (heart toggle per card), share to clipboard (`name, type1, type2`)
- [ ] Figma design application (in progress)
