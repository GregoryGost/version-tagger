# TypeScript Classes And Object Modeling

Use this reference when deciding whether TypeScript behavior should be modeled as a function/module or as a class.

## Rule

Prefer functions/modules for stateless pure transformations, small mappers, predicates, parsers, formatters, and calculations.

Prefer classes when the model has identity, state, constructor invariants, lifecycle, collaborating objects, or polymorphic behavior.

Do not convert a class to functions merely because the logic could be written as functions if the class better protects invariants or public contracts.

## When To Prefer A Class

- The object has identity and state that should stay with behavior.
- The constructor establishes invariants required by all methods.
- Several methods reuse the same constructor-supplied collaborators.
- The object has lifecycle or resource ownership.
- The class implements an interface used by a boundary.
- Subclasses are intentionally substitutable for a base class.
- A framework or runtime API expects a class.

## When To Prefer Functions Or Modules

- The logic is stateless and pure.
- The behavior is a small mapper, predicate, parser, formatter, or calculation.
- A class would only group static helpers.
- A class would have only a constructor and no durable fields or behavior.
- There is no object identity or invariant to protect.

## Class Design Rules

- Keep classes focused on one role.
- Keep constructor work limited to validation, assignment, and invariant setup.
- Avoid async work in constructors; expose an explicit factory or initialization method when needed.
- Prefer `readonly` for fields assigned once at declaration or in the constructor.
- Keep mutable state internal to the class unless the project or framework requires otherwise.
- Use accessors only when they add validation, transformation, lazy computation, compatibility, or stable API value.
- Do not add getter/setter pairs that only pass through a backing field.
- Use `implements` to check conformance to an interface, but still type class members explicitly.
- Use `extends` only for true subtype relationships. Use composition when the goal is just reuse.
- Use `override` when overriding base members if the project enables `noImplicitOverride` or if inheritance is central to the design.
- Avoid class index signatures for mixed dynamic data. Store indexed data in a dedicated `Record`, `Map`, or object field.

## Bad: Static Utility Class

```ts
export class StringUtils {
  static normalize(input: string): string {
    return input.trim().toLowerCase()
  }
}
```

## Good: Module Function For Stateless Utility

```ts
export const normalizeString = (input: string): string => {
  return input.trim().toLowerCase()
}
```

## Good: Class For Stateful Behavior

```ts
export class Counter {
  private value = 0

  increment(): void {
    this.value += 1
  }

  current(): number {
    return this.value
  }
}
```

Here the class is preferable because it owns identity and mutable state.

## Good: Class For Collaborators

```ts
interface ProductRepository {
  findById(productId: string): Promise<Product | undefined>
}

interface PricePolicy {
  calculate(product: Product): number
}

export class ProductPricingService {
  constructor(
    private readonly products: ProductRepository,
    private readonly pricePolicy: PricePolicy,
  ) {}

  async priceFor(productId: string): Promise<number | undefined> {
    const product = await this.products.findById(productId)

    if (!product) {
      return undefined
    }

    return this.pricePolicy.calculate(product)
  }
}
```

This class is preferable to passing the same collaborators through every function when the service exposes several related methods.

## `implements` Does Not Infer Method Parameters

Bad:

```ts
interface Checkable {
  check(value: string): boolean
}

class NameChecker implements Checkable {
  check(value) {
    return value.toLowerCase() === 'ok'
  }
}
```

Good:

```ts
interface Checkable {
  check(value: string): boolean
}

class NameChecker implements Checkable {
  check(value: string): boolean {
    return value.toLowerCase() === 'ok'
  }
}
```

## Inheritance And Composition

Prefer `extends` when callers can safely treat the derived class as the base class and the base contract remains valid.

Prefer composition or local helpers when there is no subtype relationship and the goal is only code reuse.

## Accessors

Use accessors when they add validation, transformation, lazy computation, compatibility, or stable API value. Avoid trivial getter/setter pairs that only pass through a backing field.

## Review Questions

- Does this class protect state, identity, invariants, lifecycle, or collaborators?
- Would standalone functions be clearer and equally safe?
- Does the constructor only validate and initialize?
- Are fields initialized under the project's strictness settings?
- Are non-reassigned fields marked `readonly` where appropriate?
- Does inheritance preserve substitutability?
- Would composition be simpler than inheritance?
- Are static-only or constructor-only classes avoided?
