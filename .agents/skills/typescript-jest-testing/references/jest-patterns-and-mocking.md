# Jest Patterns And Mocking For TypeScript

Use this reference for Jest-based TypeScript unit and integration tests.

## Jest And TypeScript Setup

- Use the Jest version and config declared by the project.
- Use the project-declared TypeScript transform: `ts-jest`, Babel TypeScript transform, SWC transform, or another approved transformer.
- Do not assume that running Jest replaces `tsc --noEmit`; Jest documentation notes that Babel TypeScript support is transpilation-only.
- Prefer explicit imports from `@jest/globals` when the project uses them for typed Jest APIs.
- Use `@types/jest` only when the project intentionally relies on Jest globals and the versions are aligned.
- Use `node` test environment for framework-neutral TypeScript logic unless the project declares another environment.
- Use `jsdom` only for DOM/component overlays or explicit project requirements.

## Test Structure

- Use `describe` to group behavior by public contract, not implementation file sections.
- Use `test` or `it` consistently with the existing project.
- Keep each test focused on one behavior.
- Use `beforeEach` for fresh test state, not for hiding important setup.
- Use `afterEach` for cleanup of spies, replaced properties, fake timers, temp files, and environment changes.
- Avoid shared mutable state between tests.

## Assertions

- Prefer direct behavior assertions with `expect` matchers.
- Use `.toBe` for primitive identity and `.toEqual` for object structure.
- Use `.rejects` and `.resolves` for promise outcomes when the project style uses them.
- Avoid snapshot-only tests for TypeScript core logic.

## Mocking Policy

Mock only when the dependency is outside the test scope or makes the test slow, flaky, or nondeterministic.

Good mocking targets:

- network clients;
- filesystem and storage;
- clocks and timers;
- random IDs;
- process environment;
- queues and external APIs;
- third-party services;
- collaborator interfaces in isolated service tests.

Avoid mocking:

- the function, class, or module under test;
- private implementation details;
- simple pure helpers that are part of the behavior being tested;
- every internal dependency by default.

## Jest Mock APIs

- Use `jest.fn()` for local callback or collaborator test doubles.
- Use `jest.spyOn()` when observing or temporarily replacing an existing method.
- Remember that `jest.spyOn()` calls the original method by default unless a mock implementation is supplied.
- Use `jest.mocked()` or `jest.Mocked<T>` for typed mocked modules or objects.
- Use `jest.mock()` for module-level replacement only when the module boundary is intentionally outside the test scope.
- Use manual mocks from `__mocks__` for stable, shared module replacements; explicitly activate user-module mocks with `jest.mock(...)`.

## Mock Cleanup

- `clearMocks` clears calls, instances, contexts, and results while keeping mock implementations.
- `resetMocks` resets mock state and removes fake implementations.
- `restoreMocks` restores spies and replaced properties to their original implementations.
- Prefer `restoreMocks` or `jest.restoreAllMocks()` when using `jest.spyOn()`.
- Keep cleanup policy centralized in Jest config or shared setup when the project already uses one.

## Timers And Time

- Use fake timers only for code that depends on timers or time.
- Restore real timers after timer-dependent tests.
- Prefer explicit clock control over waiting for real time.
- Keep timer advancement local to the test that needs it.

## TypeScript Class Testing With Jest

- Test classes through public APIs.
- Test constructor invariants and invalid constructor inputs.
- Test state transitions through public methods.
- Prefer typed fakes for simple collaborator interfaces.
- Use Jest mocks when verifying calls is the behavior under test.
- Do not weaken visibility or use `as any` to reach private fields.

## Example: Typed Collaborator Mock

```ts
import {expect, jest, test} from '@jest/globals'

interface ProductRepository {
  findById(productId: string): Promise<Product | undefined>
}

const products: jest.Mocked<ProductRepository> = {
  findById: jest.fn(),
}

test('returns undefined when product is missing', async () => {
  products.findById.mockResolvedValue(undefined)

  const service = new ProductPricingService(products, fixedPricePolicy)

  await expect(service.priceFor('missing')).resolves.toBeUndefined()
})
```

## Example: Prefer Public Behavior

```ts
import {expect, test} from '@jest/globals'

test('increments the visible count', () => {
  const counter = new Counter()

  counter.increment()

  expect(counter.current()).toBe(1)
})
```

## Review Questions

- Does the test use the project-declared Jest config and command?
- Is the TypeScript transformer known and compatible with the module format?
- Is type checking handled by the project validation flow?
- Are mocks limited to boundaries or collaborators outside the behavior under test?
- Are mocked collaborators typed?
- Are spies and fake timers restored?
- Do tests avoid private implementation details?
- Is the test deterministic without real time, real network, or shared mutable state?
