---
name: eslint-typescript
description: "Use for ESLint configuration in TypeScript projects, including typed linting, runtime globals, scripts, and Prettier compatibility."
---

# ESLint TypeScript

Use this skill when ESLint is active for a TypeScript project.

Apply `CODEX_PROJECT.md`, `.codex/rules/eslint_typescript.md`, and `typescript-core` together with this skill.

For review checks, load `references/review-checklist.md`. For official docs, load `references/official-sources.md`.

## Workflow

1. Read `CODEX_PROJECT.md`.
2. Confirm ESLint is active and identify TypeScript profile, runtime, config path, lint command, and dependency policy.
3. Inspect `package.json`, lockfile, `eslint.config.*`, `tsconfig*`, and existing lint target patterns.
4. Check whether Prettier is active and whether conflict-resolution config is present.
5. Check TypeScript file patterns such as `.ts`, `.mts`, `.cts`, `.tsx`, and project-specific paths.
6. Check runtime globals according to the active project profile and existing ESLint config scopes.
7. Preserve project-specific lint commands when declared.
8. Do not add dependencies or change package scripts without approval or dependency policy support.

## Expected Patterns

For TypeScript projects, expect some combination of:

- `eslint`;
- `@eslint/js`;
- `globals` when runtime globals are declared in flat config;
- `typescript`;
- `typescript-eslint`;
- `eslint-config-prettier` when Prettier is active.

## Review Checklist

- [ ] ESLint config path and package scripts were checked.
- [ ] TypeScript file patterns match the project.
- [ ] Runtime globals match the active project profile and file scopes.
- [ ] TypeScript config compatibility was checked.
- [ ] Typed-linting policy is explicit.
- [ ] Prettier conflict handling is present when Prettier is active.
