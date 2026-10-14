# TypeScript core rules

Apply this rule when `CODEX_PROJECT.md` declares TypeScript active or when the task directly touches TypeScript code, contracts, declarations, or type-level behavior.

## Required skills

Use together with:

- `typescript-core`.

## Source of truth

Before changing TypeScript code:

1. Read `CODEX_PROJECT.md`.
2. Check the TypeScript profile, runtime, package manager, module format, and validation commands.
3. Inspect `tsconfig*`, package scripts, and existing type/code style conventions when relevant.
4. Follow project-declared formatter, linter, type-checker, and validation commands.
5. Do not invent script names such as `lint`, `typecheck`, or `build`.

## Code style and structure

- Write concise, technical TypeScript code with clear runtime behavior.
- Prefer readable iteration and small functions over clever one-liners.
- Keep modules focused on one responsibility.
- Keep exports intentional; avoid turning local helpers into public API without a reuse need.
- Use descriptive names that express state or capability, for example `isLoading`, `hasError`, `canSubmit`, `selectedUserId`.
- Keep constants close to where they are used unless they define a shared stable contract.
- Prefer early returns for guard clauses when they reduce nesting.
- Keep side effects at explicit boundaries: IO, storage, network, timers, logging, and framework adapters.
- Preserve the project's existing import ordering and path alias conventions.
- Preserve project natural-language policy for comments and documentation.

## Type safety constraints

- Prefer explicit boundary types for public functions, API contracts, exported helpers, data mappers, and integration boundaries.
- Let local variable types be inferred when inference is obvious and stable.
- Use `unknown` for untrusted values until they are narrowed.
- Do not introduce `any` unless the reason is explicit and local.
- Prefer discriminated unions for variant state instead of loosely coupled flags.
- Prefer narrow literal unions or constant maps over broad string types.
- Do not change exported types or public contracts without checking call sites.
- Keep type helpers local unless they are reused or part of a stable shared contract.

## Function, class, and API patterns

- Prefer functions for stateless pure transformations, small mappers, predicates, and utilities.
- Prefer classes when the model has identity, state, constructor invariants, lifecycle, or polymorphic behavior.
- When a class better preserves invariants than loose functions, prefer the class.
- Keep function parameters explicit and avoid boolean-flag APIs when a named options object or discriminated union is clearer.
- Prefer pure functions for transformations and calculations.
- Keep parsing, validation, mapping, and business logic as separate boundaries when the codebase already follows that pattern.
- Do not replace runtime validation with TypeScript types; external data still needs runtime checks.
- Avoid broad type assertions. Narrow values instead.
- Keep generic helpers simple and justified by real reuse.

## Classes and object modeling

- Use a class when state and behavior must stay together.
- Use constructors to establish valid object state.
- Use `implements` for interface conformance checks and still annotate method parameters explicitly.
- Use `extends` only for true subtype relationships; prefer composition for simple reuse.
- Use `override` for intentional overrides when the project enables it.
- Prefer `readonly` for fields assigned only at declaration or in the constructor.
- Avoid static-only utility classes and constructor-only wrappers.
- Avoid trivial getter/setter pairs without extra behavior.
- Avoid class index signatures for mixed dynamic data.

## Async and error handling

- Await asynchronous work at the boundary where the result is needed.
- Handle expected failure modes explicitly.
- Do not swallow errors silently.
- Preserve existing error/result conventions used by the project.
- Keep retry, timeout, cancellation, and fallback behavior explicit when they are relevant.

## Implementation constraints

- Keep runtime code simple.
- Avoid type-level abstractions that make ordinary code harder to read.
- Avoid duplicate interfaces or parallel models for the same data shape.
- Do not add dependencies for type convenience unless the user approves them or `CODEX_PROJECT.md` allows them.
