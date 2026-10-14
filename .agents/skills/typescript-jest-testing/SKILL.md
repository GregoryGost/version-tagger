---
name: typescript-jest-testing
description: "Use for framework-neutral TypeScript unit and integration testing with Jest, typed test doubles, and coverage."
---

# TypeScript Jest Testing

Use this skill when framework-neutral TypeScript unit or integration testing through Jest is active, or when the task directly adds, changes, or reviews Jest tests for TypeScript code.

Apply `.codex/rules/typescript_jest_testing.md` and `typescript-core` together with this skill.

Load references when needed:

- `references/jest-patterns-and-mocking.md` for Jest-specific patterns, mocking, cleanup, timers, and TypeScript usage.
- `references/class-testing-patterns.md` for class/object model testing examples.
- `references/official-sources.md` for official Jest, ts-jest, and TypeScript references.

## Workflow

1. Read `CODEX_PROJECT.md`.
2. Confirm Jest version, config path, test command, coverage policy, dependency policy, test environment, and test file patterns.
3. Inspect `package.json`, lockfile, `jest.config.*`, `tsconfig*`, setup files, and existing Jest tests.
4. Identify TypeScript handling: `ts-jest`, Babel TypeScript transform, SWC transform, or another project-declared transformer.
5. Review the TypeScript core model used by the code under test: function/module or class/object.
6. Classify the requested test as unit or integration.
7. Add or update tests using existing project conventions and Jest APIs.
8. Run or report the project-declared Jest command.

## Baseline

- Use Jest as the TypeScript test runner for this skill.
- Keep Vue, DOM, component, E2E, and browser UI testing in overlays.
- Use unit tests for isolated TypeScript logic.
- Use integration tests for multiple modules or classes working together.
- Prefer typed test helpers and explicit test doubles.
- Preserve class-based design when TypeScript core selected a class for identity, state, invariants, lifecycle, collaborators, or polymorphism.
- Keep TypeScript type checking as a separate validation concern unless the project explicitly runs it through Jest tooling.

## Jest And Mocking

- Prefer real code for behavior under test and mock only external, slow, nondeterministic, or out-of-scope boundaries.
- Use typed fakes or stubs for simple collaborator contracts.
- Use `jest.fn`, `jest.spyOn`, `jest.mocked`, and `jest.Mocked<T>` according to project style.
- Restore spies and replaced properties after tests.
- Keep manual mocks stable, local to the mocked module pattern, and explicitly activated.
- Use fake timers only for timer/time-dependent logic and restore real timers after use.

## Class Testing

- Test public behavior, not private implementation details.
- Test constructor invariants and invalid inputs when constructors validate state.
- Test state transitions through public methods.
- Test collaborator interaction with typed fakes, stubs, or Jest mocks.
- Do not weaken visibility or export local implementation details only for tests.

## Review Checklist

- [ ] Project testing profile was checked.
- [ ] Jest config, command, environment, and TypeScript transformer were checked.
- [ ] Test type matches the behavior scope.
- [ ] Function/module vs class/object model was preserved.
- [ ] Constructor invariants, state transitions, lifecycle, and collaborators are covered when classes are involved.
- [ ] Mocks are typed, local, and limited to appropriate boundaries.
- [ ] Mock cleanup and fake timer cleanup are handled.
- [ ] Dependencies are present or recommended without unauthorized changes.
- [ ] Tests are deterministic.
- [ ] Project-declared Jest command was run or reported as unavailable.
