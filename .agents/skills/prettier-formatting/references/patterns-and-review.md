# Prettier Formatting Patterns And Review

Use this reference when adding, changing, or reviewing Prettier formatting setup.

## Good: Formatter Scope Is Explicit

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

This is acceptable only when the project policy allows repository-wide formatting.

For targeted work, prefer scoped commands declared by the project, for example:

```json
{
  "scripts": {
    "format:changed": "prettier --write src/**/*.ts src/**/*.vue"
  }
}
```

## Bad: Broad Write Formatting Without Policy

```bash
prettier --write .
```

Problems:

- Unrelated files can change.
- Review diffs become noisy.
- Generated or vendored files can be touched if ignore policy is incomplete.

## Good: Ignore Policy Is Checked

```gitignore
# .prettierignore
dist/
coverage/
node_modules/
*.min.js
```

Why this is good:

- Formatter avoids generated and external files.
- Broad commands are safer when policy allows them.

## Good: ESLint Conflict Handling

```json
{
  "extends": ["eslint:recommended", "prettier"]
}
```

Why this is good:

- Prettier owns formatting.
- ESLint avoids fighting formatter output.

## Bad: Semantic Linting Hidden In Formatting

```json
{
  "scripts": {
    "format": "eslint --fix . && prettier --write ."
  }
}
```

Problems:

- Formatting and semantic fixes are mixed.
- A formatting task can change code behavior.
- Reviewers cannot easily separate formatting from lint fixes.

## Good: Tailwind Class Ordering Lives In Formatter Policy

```json
{
  "devDependencies": {
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

Use this only when Tailwind is active and project policy enables class sorting.

## Bad: Tailwind Skill Owns Formatter Plugins

Do not add Prettier plugin decisions to `tailwind-expert`. Tailwind skill owns utility usage. Prettier skill owns formatter plugin and class ordering policy.

## Review Questions

- Is Prettier active in `CODEX_PROJECT.md`?
- Which files are in formatter scope?
- Is check-only validation enough for this task?
- Is write formatting explicitly requested or project-approved?
- Are generated, vendored, coverage, build, and snapshot files ignored when needed?
- If ESLint is active, is formatter conflict handling present?
- Is any Prettier plugin required by active file formats or project policy?
- If Tailwind class sorting is enabled, is it configured through Prettier policy rather than Tailwind rules?
