---
name: prettier-formatting
description: "Use for Prettier configuration, formatting commands, ignore rules, plugin policy, and ESLint integration."
---

# Prettier Formatting

Use this skill when Prettier is active in `CODEX_PROJECT.md` or when the task directly changes formatting config, formatting scripts, formatter dependencies, formatter plugin setup, class ordering policy, or formatter output.

Apply `.codex/rules/prettier_formatting.md` together with this skill.

Load references when needed:

- `references/patterns-and-review.md` for Prettier setup, plugin, scope, and review patterns.
- `references/official-sources.md` for official Prettier and formatter plugin sources.

## Workflow

1. Read `CODEX_PROJECT.md`.
2. Confirm Prettier is active and identify config path, ignore file, package manager, formatter command, and format-check command.
3. Inspect `package.json`, lockfile, Prettier config, `.prettierignore`, ESLint config, and active overlays when relevant.
4. Check whether ESLint is active and conflict-resolution config is present.
5. Check whether plugin-driven formatting is project-approved, especially Tailwind class sorting, import sorting, Astro/Svelte/Markdown plugins, or package-specific plugins.
6. Use project-declared commands; do not guess command names.
7. Prefer check-only validation unless the task or project policy calls for write formatting.
8. Avoid broad write formatting unless explicitly requested or project policy allows it.

## Expected Patterns

- `prettier` formats code and supported text formats.
- `prettier --check` validates formatting without writing when such a script exists.
- `prettier --write` rewrites files and must be scoped intentionally.
- `eslint-config-prettier` resolves formatter-related ESLint conflicts when ESLint and Prettier are both active.
- `prettier-plugin-tailwindcss` belongs here, not in `tailwind-expert`, and is allowed only when Tailwind class sorting is approved by project policy.
- Prettier plugin changes must be reflected in config, lockfile, package scripts, and review notes when applicable.

## Review Checklist

- [ ] Prettier config and ignore file were checked.
- [ ] Formatter commands came from the project profile or package scripts.
- [ ] ESLint conflict handling is present when ESLint is active.
- [ ] Formatter plugin policy was checked before adding or relying on plugins.
- [ ] Tailwind class ordering is handled only when project policy enables it.
- [ ] Formatter scope is intentional and avoids unrelated files.
- [ ] No unrelated files were reformatted without permission.
