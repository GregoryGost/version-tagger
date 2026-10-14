# TypeScript Jest Class Testing Patterns

Use this reference when Jest tests cover TypeScript classes, object modeling, constructor invariants, stateful behavior, lifecycle, or collaborators.

Examples use explicit imports from `@jest/globals`. If the target project intentionally uses Jest globals with `@types/jest`, follow the project style instead.

## Baseline

- Preserve the function/module vs class choice made by `typescript-core`.
- Test public behavior instead of private implementation details.
- Test constructor invariants when a constructor validates or normalizes state.
- Test state transitions through public methods.
- Test collaborator interaction through typed fakes, stubs, or Jest mocks.
- Keep tests deterministic by controlling time, randomness, IDs, IO, storage, network, and filesystem boundaries.

## Bad: Testing Private Implementation

```ts
import {expect, test} from '@jest/globals'

class Counter {
  private value = 0

  increment(): void {
    this.value += 1
  }

  current(): number {
    return this.value
  }
}

test('increments value', () => {
  const counter = new Counter()

  counter.increment()

  expect((counter as any).value).toBe(1)
})
```

Problems:

- The test uses `any` to bypass class visibility.
- The test is coupled to implementation details.
- The public contract is not what the assertion targets.

## Good: Testing Public Behavior

```ts
import {expect, test} from '@jest/globals'

test('increments the visible count', () => {
  const counter = new Counter()

  counter.increment()

  expect(counter.current()).toBe(1)
})
```

## Constructor Invariants

```ts
import {expect, test} from '@jest/globals'

class Percentage {
  constructor(readonly value: number) {
    if (value < 0 || value > 100) {
      throw new Error('Percentage must be between 0 and 100')
    }
  }
}

test('rejects invalid percentage values', () => {
  expect(() => new Percentage(120)).toThrow('Percentage must be between 0 and 100')
})
```

## Collaborator Testing With A Typed Fake

```ts
import {expect, test} from '@jest/globals'

interface ProductRepository {
  findById(productId: string): Promise<Product | undefined>
}

class FakeProductRepository implements ProductRepository {
  constructor(private readonly product: Product | undefined) {}

  async findById(): Promise<Product | undefined> {
    return this.product
  }
}

test('returns undefined when product is missing', async () => {
  const service = new ProductPricingService(
    new FakeProductRepository(undefined),
    fixedPricePolicy,
  )

  await expect(service.priceFor('missing')).resolves.toBeUndefined()
})
```

## Collaborator Testing With A Typed Jest Mock

```ts
import {expect, jest, test} from '@jest/globals'

const products: jest.Mocked<ProductRepository> = {
  findById: jest.fn(),
}

test('uses repository result for pricing', async () => {
  products.findById.mockResolvedValue(sampleProduct)

  const service = new ProductPricingService(products, fixedPricePolicy)

  await expect(service.priceFor(sampleProduct.id)).resolves.toBe(100)
})
```

## Review Questions

- Does the test respect the class public API?
- Does it avoid direct private-member assertions?
- Does it cover constructor validation and state transitions when relevant?
- Are collaborators typed and intentionally fake or mocked?
- Does it preserve the project error/result convention?
- Are Jest mocks, spies, and timers cleaned up when used?
