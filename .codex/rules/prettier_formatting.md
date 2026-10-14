# Prettier formatting rules

Apply this rule when `CODEX_PROJECT.md` declares Prettier active or when the task changes formatting configuration, formatting scripts, formatter dependencies, formatter plugins, class ordering policy, or formatter output.

## Required skills

Use together with:

- `prettier-formatting`.

## Source of truth

Before changing Prettier setup:

1. Read `CODEX_PROJECT.md`.
2. Check Prettier config path, ignore file, format commands, dependency policy, package manager, active stack profile, and active overlays.
3. Inspect `package.json`, lockfile, `.prettierrc*`, `prettier.config.*`, `.prettierignore`, ESLint config, and formatter scripts.
4. Load `prettier-formatting/references/patterns-and-review.md` when adding or changing formatter config, scripts, plugins, class ordering, or broad formatting scope.
5. Use project-declared commands and file scopes.

## Expected tooling

A TypeScript formatting setup usually needs:

- `prettier`;
- `eslint-config-prettier` when ESLint is active.

Optional tooling belongs to this formatter rule:

- `prettier-plugin-tailwindcss` only when Tailwind class sorting is enabled by project policy;
- other Prettier plugins only when required by file formats or approved by project policy.

## Constraints

- Keep Prettier responsible for formatting, not semantic linting.
- Prefer separate Prettier commands over running Prettier inside ESLint unless the project explicitly uses that workflow.
- Use check-only validation when the project declares it.
- Use write formatting only when requested or declared as the correct workflow.
- Avoid broad formatting changes unless the project profile or user request permits them.
- Do not add Prettier plugins without approval or project policy.
- Keep Tailwind class ordering policy in this formatter rule.
- Do not reformat generated files, snapshots, build artifacts, vendored files, or binary-derived text unless project policy requires it.
- Keep formatting-only changes separate from semantic code changes when possible.

## Overlay-specific notes

- Vue: format `.vue` files only through project-approved Prettier/Vue parser setup.
- CSS/SCSS: formatting may change whitespace and wrapping, not architecture decisions.
- Tailwind: class ordering requires explicit project policy and plugin setup.
- Markdown/YAML/JSON: include only when project formatting scope includes docs/config files or the task directly changes them.
