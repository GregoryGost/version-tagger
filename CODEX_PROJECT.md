# Codex Project Profile — version-tagger

This profile adapts [agent-projects-tools](https://github.com/GregoryGost/agent-projects-tools).
Apply `.codex/rules/request_routing.md` to every request. When an active material declares a hard dependency,
validate it with `.codex/rules/material_dependencies.md` before applying that material.

## Project Identity

- Project key: `version-tagger`
- Workspace: `GregoryGost/version-tagger`
- Project type: GitHub Action / TypeScript library
- Primary programming language: TypeScript
- Secondary languages: JavaScript, YAML, Markdown

## Natural Language Profile

- User-facing answers: Russian.
- Git commit messages: English, as used in existing repository history.
- Code comments, test names and project documentation: English.
- Keep code identifiers, paths, commands, dependencies and protocol names in English.
- Formatting: two-space indentation, single quotes and semicolons per `.prettierrc`.

## Active Stack Profiles

- `typescript-core`
- `typescript-jest-testing`
- `eslint-typescript`
- `prettier-formatting`

## Active Rules

- Mandatory routing: `.codex/rules/request_routing.md`
- Conditional validator: `.codex/rules/material_dependencies.md`
- `source_code_hygiene.md`
- `git.md`
- `typescript_core.md`
- `typescript_jest_testing.md`
- `eslint_typescript.md`
- `prettier_formatting.md`

## Active Skills

- `typescript-core`
- `typescript-jest-testing`
- `eslint-typescript`
- `prettier-formatting`

All active skill packages are vendored under `.agents/skills/` with their referenced materials.
Legacy `.codex/AGENTS.md` and legacy rules are not activation signals for this profile.

## TypeScript And Node.js Profile

- Node.js runtime for GitHub Action: Node 24, declared in `action.yml`.
- Package Node.js support, TypeScript and pnpm version sources: `package.json`, `pnpm-lock.yaml`, and CI.
- Package manager: pnpm 10; install reproducibly with `--frozen-lockfile`.
- Source: `src/`, ES imports; `tsup` creates one CommonJS bundle.
- Entry point for consumers: checked-in `dist/index.js`, independent of installed `node_modules`.
- Node.js configuration: `tsconfig.json`; Jest configuration: `tsconfig.jest.json`.
- Runtime packages: `@actions/core`, `@actions/github`, `semver`. Preserve their bundling via `tsup.config.ts`.

## TypeScript Jest Testing Profile

- Jest runner: `jest.config.json`; `ts-jest` transformer; `node` test environment.
- Unit tests: `__tests__/**/*.test.ts`, with Jest globals and `@jest/globals` as used by existing tests.
- Coverage is enabled for `src/`.
- Mock GitHub API calls; do not create real tags or write remote state from tests.

## ESLint And Prettier Profiles

- ESLint flat config: `eslint.config.ts`; preserve existing TypeScript and Jest lint rules.
- Prettier config: `.prettierrc` and `.prettierignore`.
- Treat copied agent template files as vendored material: do not rewrite upstream text during source formatting.

## Build And Validation Commands

Commands are sourced from `package.json`. Use only project-declared scripts and installed pnpm binaries.

- Install dependencies: `pnpm install --frozen-lockfile`
- Format check: `pnpm run format:check`
- Format changed source: `pnpm prettier --write <changed paths>`
- Lint: `pnpm run lint`
- Unit tests: `pnpm run ci-test`
- Type check: `pnpm exec tsc --noEmit`
- Build: `pnpm run bundle` (`format:write` then `pnpm run package`)
- Artifact validation: `git diff --exit-code -- dist/index.js` after building
- CI sources: `.github/workflows/ci.yml` and `.github/workflows/check-dist.yml`

## Dependencies And Repository Policy

- The dependency source of truth is `package.json` and `pnpm-lock.yaml`.
- New dependencies require explicit user approval.
- Runtime modules must remain bundled into `dist/index.js`.
- Changes go through a dedicated branch and pull request targeting `develop`; never push directly to `develop`.
- GitHub API/connector mutations only when the current user request authorizes them.
- Project profile activation does not authorize external account, local environment, or Obsidian changes.

## Project Description

Version Tagger produces Semantic Versioning release and prerelease Git tags.
Project contracts are described in `README.md` and `action.yml`.
Self-versioning is configured in `.github/workflows/develop-self-versioning.yml` and
`.github/workflows/main-self-versioning.yml`.
