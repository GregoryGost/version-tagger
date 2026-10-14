---
name: typescript-core
description: "Use for framework-neutral TypeScript implementation, typing, public contracts, safe refactoring, and code review."
---

# TypeScript Core

Use this skill for TypeScript code changes, TypeScript review, type-level refactoring, class/object modeling, contract updates, DTO/model changes, and framework-specific work that depends on TypeScript correctness.

Apply `CODEX_PROJECT.md` and `.codex/rules/typescript_core.md` together with this skill.

Load references when needed:

- `references/patterns-and-style.md` for framework-neutral TypeScript code style and structure patterns.
- `references/classes-and-object-modeling.md` for choosing between functions/modules and classes, and for class-specific patterns.
- `references/review-checklist.md` for review prompts and anti-patterns.
- `references/official-sources.md` for official documentation and best-practice references.

## Workflow

1. Read `CODEX_PROJECT.md`.
2. Confirm that TypeScript is active or that the task explicitly touches TypeScript.
3. Inspect `tsconfig*`, package scripts, module format, runtime, and existing type/code style conventions when available.
4. Identify public boundaries affected by the task: exports, DTOs, API clients, public helpers, classes, integration inputs and outputs, and test helpers.
5. Decide whether the behavior is better modeled as a function/module or a class.
6. Make the smallest change that preserves existing contracts.
7. Keep implementation structure consistent with the existing project.
8. Narrow untrusted data before use.
9. Check call sites when a type changes.
10. Run or report the TypeScript validation command declared in `CODEX_PROJECT.md` when possible.

## Code Style Baseline

- Keep modules focused and exports intentional.
- Prefer small readable functions over clever one-liners.
- Use descriptive names for state, capability, and domain concepts.
- Keep constants local unless they define a shared stable contract.
- Prefer early returns when they reduce nesting.
- Keep side effects at explicit boundaries.
- Preserve project import ordering, path aliases, formatter, and linter conventions.

## Classes And Object Modeling

- Prefer functions for stateless utilities, pure transformations, predicates, and mappers.
- Prefer classes when identity, state, constructor invariants, lifecycle, or polymorphic behavior are part of the model.
- Prefer a class over loose functions when the class keeps invariants safer or makes collaborating objects explicit.
- Avoid static-only utility classes and constructor-only wrappers.
- Use `implements`, `extends`, `override`, `readonly`, access modifiers, and parameter properties according to project policy and TypeScript rules.

## Type Boundaries

Prefer explicit types at public or integration boundaries and keep local variables inferred when inference is clear.

## Guardrails

- Avoid `any` unless the reason is documented and local.
- Do not replace runtime validation with TypeScript types.
- Keep generic helpers simple and justified by reuse.
- Do not change exported type names or shapes without checking consumers.
- Do not add dependencies for type convenience without project policy or user approval.

## Review Checklist

- [ ] Project profile and TypeScript profile were checked.
- [ ] Existing style, imports, module format, and validation commands were checked.
- [ ] Function vs class modeling was reviewed for the changed behavior.
- [ ] Public contracts changed only intentionally.
- [ ] Untrusted input is narrowed before use.
- [ ] Tests and call sites were reviewed when a type boundary changed.
- [ ] Project-declared type check command was run or explicitly reported as unavailable.
