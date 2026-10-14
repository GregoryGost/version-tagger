# TypeScript Jest testing rules

Apply this rule when `CODEX_PROJECT.md` declares framework-neutral TypeScript unit or integration testing through Jest active, or when the task directly changes Jest tests for TypeScript code.

This rule is framework-neutral and Jest-based. Vue, DOM, component, E2E, and browser UI testing belong in stack-specific overlays.

## Required skills

Use together with:

- `typescript-jest-testing`;
- `typescript-core`.

## Source of truth

Before adding or changing tests:

1. Read `CODEX_PROJECT.md`.
2. Check Jest version, Jest config path, declared test command, coverage policy, dependency policy, test environment, and test file patterns.
3. Inspect `package.json`, lockfile, `jest.config.*`, `tsconfig*`, setup files, and existing Jest tests.
4. Check how TypeScript is handled for Jest: `ts-jest`, Babel TypeScript transform, SWC transform, or another project-declared transformer.
5. Review the TypeScript core modeling decision: function/module vs class.
6. Use project-declared commands.
7. Do not add Jest dependencies, transformers, environments, or plugins without user approval or dependency policy support.

## Testing boundaries

- Unit tests cover pure functions, modules, mappers, validation logic, class invariants, public methods, and isolated services.
- Integration tests cover interaction between multiple project modules, classes, services, adapters, and collaborators without requiring browser UI automation.
- Vue, DOM, component, E2E, and browser workflows belong in stack-specific overlays.

## Jest baseline

- Use Jest as the TypeScript test runner for this rule set.
- Prefer imports from `@jest/globals` in TypeScript tests when the project uses explicit imports for typed Jest APIs.
- Use `@types/jest` only when the project intentionally relies on Jest globals without explicit imports and the versions are aligned.
- Do not assume that Jest execution replaces TypeScript type checking. Keep the project-declared type-check command when required.
- Keep test environment explicit: `node` for framework-neutral TypeScript logic by default; `jsdom` only when the project or overlay requires DOM APIs.
- Keep Jest setup files small and use them only for shared test setup that is stable across many tests.

## Mocking policy

- Prefer testing real TypeScript logic and public behavior before mocking.
- Mock only boundaries that are slow, non-deterministic, external, stateful, or outside the test scope: network, filesystem, clock, random IDs, process environment, storage, queues, and third-party APIs.
- Prefer constructor-injected collaborators and typed fakes/stubs for class-based code.
- Use `jest.fn`, `jest.spyOn`, `jest.mocked`, and `jest.Mocked<T>` according to the existing project style.
- Prefer `jest.spyOn` for observing existing object methods and restore spies after each test.
- Use manual mocks only for stable module-level replacements, and keep them close to the mocked module under `__mocks__` when that pattern is used.
- Avoid over-mocking internal implementation details.
- Do not test private implementation details directly.
- Do not weaken visibility or export private helpers only to make tests easier.

## Class and object model testing

When `typescript-core` prefers a class, tests must respect that model instead of rewriting the design into loose functions for test convenience.

- Test class behavior through the public API.
- Test constructor validation and initial invariants when the constructor establishes valid object state.
- Test state transitions through public methods.
- Test lifecycle methods such as start/stop, open/close, connect/disconnect, or subscribe/unsubscribe when present.
- Test collaborator interaction through typed fakes, stubs, or Jest mocks that implement the declared interface.
- Prefer deterministic clocks, IDs, randomness, storage, network, and filesystem boundaries.

## Jest cleanup and determinism

- Ensure mock state does not leak between tests.
- Prefer project-level `clearMocks`, `resetMocks`, and `restoreMocks` policy when configured.
- Understand the difference: clearing keeps mock implementations, resetting removes fake implementations, restoring returns spies/replaced properties to their original implementation.
- Use fake timers only when code depends on timers or time, and restore real timers after the test or suite.
- Avoid shared mutable state across tests.

## Test design constraints

- Prefer behavior-focused assertions.
- Keep mocks local, typed, and explicit.
- Avoid snapshot-only tests.
- Use deterministic inputs and isolate time, randomness, network, and filesystem effects.
- Keep test helpers small and typed.
- Preserve project conventions for exceptions, result objects, nullable returns, and error objects.
