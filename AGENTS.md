# Agent Bootstrap

Determine the repository mode before doing work.

## Mandatory Request Routing

`.codex/rules/request_routing.md` is mandatory in both target projects and the `agent-projects-tools` template repository.

Before any task-specific tool call, file edit, MCP operation, external-system call, or final answer:

1. Read and apply `.codex/rules/request_routing.md`.
2. Classify the current user message independently from previous turns.
3. Resolve the allowed and forbidden surfaces and side effects.
4. Continue only within the selected mode and surface gate.

The initial read of `.codex/rules/request_routing.md` is the only bootstrap file operation allowed before its gate is resolved. This rule does not depend on `CODEX_PROJECT.md` activation and must not be omitted, set to `none`, disabled, or replaced by another routing rule.

## Target Project Mode

Use this mode in a project that consumes rules, skills, and the project profile from this repository.

1. Apply the mandatory request-routing gate above.
2. Read `CODEX_PROJECT.md` when it exists. It is the source of truth for project-specific stack choices, paths, natural-language/style profile, dependency policy, migration policy, validation commands, and enabled external systems.
3. If `CODEX_PROJECT.md` is missing or incomplete, inspect repository evidence first: manifests, package manager files, lockfiles, framework configs, source tree, test configs, build configs, and documentation.
4. If the project type and active profiles can be determined with confidence, create or update `CODEX_PROJECT.md` from `.codex/project.template.md`. If material choices remain ambiguous, ask the user before creating or changing the profile.
5. Resolve activation for additional rules and skills from exact entries in `Active Rules`, exact entries in `Active Skills`, active stack profiles, and enabled specialized profile sections.
6. Before applying an active rule or skill, read its entrypoint.
7. When the entrypoint declares hard dependencies, require `.codex/rules/material_dependencies.md` to exist and apply it as a conditional bootstrap support rule, even when it is not listed in `Active Rules`.
8. If the validator file is missing or a required dependency is invalid, report the profile error and do not apply the dependent artifact.
9. Apply only materials that match the task, are active through an allowed signal, and have valid required dependencies.
10. Report conflicting activation signals instead of guessing. Optional activation entries cannot disable `request_routing.md`.

## Active Material Execution Invariants

- Resolve applicable rules and skills only from activation signals allowed by this bootstrap and `CODEX_PROJECT.md`.
- Read every applicable rule or skill entrypoint before relying on it. A remembered workflow, previous tool result, prior conversation, or generic capability is not a substitute for the current active entrypoint.
- Validate declared hard dependencies before applying the dependent artifact.
- An active rule or skill may narrow the selected request mode, allowed surfaces, side effects, or output format, but cannot broaden authorization from the current user message.
- Before a mutation, the candidate action must satisfy both request routing and every applicable active material. A prohibition from either boundary wins.

## Template Repository Mode

Use this mode when working in the `agent-projects-tools` source repository itself.

1. Apply the mandatory request-routing gate above.
2. Do not create `CODEX_PROJECT.md`; its absence is intentional in this template repository.
3. Read `README.md`, `.codex/project.template.md`, and the rules, skills, metadata, and references directly relevant to the requested repository change.
4. Apply `.codex/rules/material_dependencies.md` when adding, changing, or reviewing dependency declarations.
5. Treat `.codex/project.template.md`, `.codex/rules/`, and `.agents/skills/` as source artifacts being maintained, not as an active application stack.
6. Check affected cross-references, profile identifiers, rule names, skill names, hard dependencies, metadata, and README coverage before completing a change.

Keep `AGENTS.md` small. Detailed workflows belong in `.codex/rules/`, `.agents/skills/`, or skill `references/`.

## Hard Constraints

- `.codex/rules/request_routing.md` must exist and be applied for every new user message in both repository modes.
- Never omit, disable, replace, or set the mandatory request-routing rule to `none` in a target project's `CODEX_PROJECT.md`.
- `.codex/rules/material_dependencies.md` is conditionally mandatory whenever an active artifact declares hard dependencies; it does not require a separate `Active Rules` entry.
- Do not apply a dependent artifact when the validator file or any required rule or skill is missing, inactive, disabled, ambiguous, or set to `none`.
- Do not silently activate missing dependencies or unrelated overlays.
- `.codex/project.template.md` is a template, not an active rule. Do not load it as a rule after a target project's `CODEX_PROJECT.md` is complete.
- Never create `CODEX_PROJECT.md` inside the `agent-projects-tools` template repository.
- In a target project, use repository metadata for profile discovery, but do not invent project-specific stack choices when material evidence is missing or ambiguous.
- Do not add new dependencies unless the user explicitly approves it or the target project's `CODEX_PROJECT.md` explicitly allows it.
- Do not silently resolve contradictory activation entries.
- In the template repository, activation restrictions do not prevent reviewing or editing an artifact directly in the requested maintenance scope.
- If Obsidian is enabled in a target project's `CODEX_PROJECT.md`, use only the configured Obsidian MCP server for vault content.
- If Obsidian MCP is unavailable, use only the fallback outbox paths declared in the target project's `CODEX_PROJECT.md`, then synchronize through MCP after successful verification.
- You need to remember what rules and what skills are available and use them when necessary.
- It is impossible to draw any conclusions based only on superficial data; it is necessary to conduct an analysis as deeply and in detail as possible.

## Review Expectations

- Review code and tests together when the task touches implementation.
- In target projects, apply relevant rules and specialist skills only after activation and required-dependency validation.
- In the template repository, review the requested artifacts together with directly dependent rules, skills, references, metadata, and README entries.
- Run or report the relevant validation commands declared by the target project's `CODEX_PROJECT.md` when possible.