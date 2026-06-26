# Lifelong2 Front

Frontend application for the Lifelong2 project, built with Quasar Framework, Vue 3, TypeScript, and Pinia.

## Requirements

- Node.js `>=22.22.0`
- npm `>=11.0.0`

The generated Quasar tooling requires Node `22.22.0` or newer. Node `22.15.0` is not enough for `quasar prepare`.

## Setup

```bash
npm install
```

`npm install` also runs Husky through the `prepare` script so Git hooks are ready after dependencies are installed.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Quality Checks

```bash
npm run lint
npm run format
```

Before committing, staged `src/**/*.{ts,vue}` files are checked by `lint-staged`. Commit messages are validated with Conventional Commits, for example:

```bash
feat(frontend): setup quasar app
```

## Project Structure

- `src/assets` stores static assets.
- `src/boot` stores client-side initialization files.
- `src/components/base` stores reusable base UI components.
- `src/composables` stores shared Composition API logic.
- `src/css` stores global Sass styles.
- `src/layouts` stores Quasar layouts.
- `src/pages` stores route pages.
- `src/router` stores route definitions.
- `src/stores` stores Pinia state that is shared across the app.
- `src/types` stores TypeScript interfaces and types.
- `src/utils` stores helper functions.
