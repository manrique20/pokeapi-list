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
| Icons | **`@nuxt/icon`** (Iconify, Material Symbols) + custom SVG | Material Symbols for nav/actions/type badges; a handful of custom SVGs (`public/empty/`, `public/pokedex/`) for empty states and detail-page stats/gender, matching the Figma exactly where an icon font didn't |
| Typography | **Poppins** (Google Fonts) | Loaded via `app.head.link` in `nuxt.config.ts` for the empty-state title/text; rest of the UI uses the base `Inter` stack |
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
├─ assets/scss/            → tokens, mixins, base + one partial per component/page
├─ components/ui/          → AppDrawer, AppFooterNav, EmptyState, PokeballLoader, PokemonCard, SwipeToDeleteItem
├─ composables/            → useFirstTime, useFocusTrap, useInfiniteScroll, usePokemonDetails
├─ layouts/                → main.vue (footer with 4 tabs)
├─ locales/                → es.json / en.json (translations)
├─ pages/
│  ├─ pokedex/
│  │  ├─ index.vue         → list (search, type filter, infinite scroll)
│  │  └─ [name].vue        → single Pokémon detail
│  ├─ favorites.vue, regions.vue, profile.vue, onboarding.vue, index.vue (splash)
├─ plugins/                → favorites-persist.client.ts
├─ stores/                 → favorites (Pinia)
├─ utils/                  → constants (storage keys), pokemon (formatters + type icons), type-chart (weakness calculation)
└─ app.vue                 → NuxtLayout + NuxtPage
cypress/
├─ e2e/                    → onboarding, footer navigation, pokedex (list/filters), pokemon detail, favorites
├─ component/              → PokeballLoader
└─ support/
public/
├─ empty/, pokedex/        → custom SVGs (empty states, detail-page stats, gender icons)
└─ favicon.ico
```

## Architecture notes

- **Pages & flow**: `/` (splash) → `/onboarding` (first visit, flag in `localStorage`) → `/pokedex`. The four main sections (Pokédex, Regiones, Favoritos, Perfil) share `layouts/main.vue` with a fixed footer nav. Page files are in English (`regions.vue`, `favorites.vue`, `profile.vue`); Spanish labels come from i18n.
- **Naming**: all files and folders in English, kebab-case.
- **Styles**: all styling is centralized in `app/assets/scss` — variables and mixins are injected into SFC scoped styles automatically (`vite.css.preprocessorOptions.scss.additionalData`).
- **Components**: `components/` subfolders do not prefix component names (`components.pathPrefix: false`), so `<PokeballLoader>` / `<AppFooterNav>` resolve directly.
- **Favorites**: `stores/favorites.ts` normalizes names to lowercase; `plugins/favorites-persist.client.ts` hydrates from and persists to `localStorage` (`pokeapi:favorites`).
- **List & pagination**: `pages/pokedex/index.vue` loads the PokeAPI list incrementally — `useInfiniteScroll` (a thin wrapper over the native `IntersectionObserver`, no external dependency) watches a sentinel at the end of the list and follows the `next` URL PokeAPI returns, appending pages as the user scrolls. Per-Pokémon detail (types, for badges/card color) is fetched in parallel per page and cached in memory via `usePokemonDetails`, so search/filtering/revisits never refetch.
- **Detail page**: `pages/pokedex/[name].vue` — hero colored by the Pokémon's primary type, species data (description, category, gender split) and its localized ability name, plus a **weaknesses** section computed by `utils/type-chart.ts`'s `computeWeaknesses()`, which combines the damage multiplier across *all* of the Pokémon's types (not a naive union of each type's own weaknesses — e.g. Bulbasaur's Grass/Poison typing resists Ground, correctly excluding it even though Poison alone is weak to it).
- **Navigation**: `PokemonCard` is itself a `NuxtLink` to its detail page (`@click.stop` on the favorite heart so toggling it doesn't also trigger navigation). On the Favorites page, each card is additionally wrapped in `SwipeToDeleteItem` (native Pointer Events, no gesture library) to remove a favorite by swiping.
- **Accessibility**: `AppDrawer` implements a focus trap and focus restoration via `useFocusTrap` (Tab cycles inside the dialog, Escape closes it, focus returns to the trigger). On desktop the filter drawer switches from a full-width bottom sheet to a centered, narrower modal.
- **Agent reference**: `.opencode/skills/pokeapi-list/SKILL.md` documents the project for AI agents (structure, conventions, commands).
