# TypeScript Patterns And Style

Use this reference when a TypeScript task needs framework-neutral code structure, naming, and implementation guidance.

These examples are best-practice examples for reusable TypeScript work. They are not a replacement for project-specific style in `CODEX_PROJECT.md`.

## Grounding

Official TypeScript documentation is the source for language behavior: narrowing, strictness options, utility types, modules, and compiler configuration. Style examples in this file are project-neutral interpretations built on those language features and on common maintainability practice.

## Module Structure

- Keep each module focused on one responsibility.
- Prefer a small number of intentional exports over exporting every helper.
- Keep private helpers local to the module that uses them.
- Split parsing, validation, mapping, and business logic when doing so matches the existing project structure.
- Keep side effects at explicit boundaries: IO, storage, network, timers, logging, framework adapters.

### Bad: broad module with mixed responsibilities

```ts
export const TAX = 0.2

export async function handleOrder(input: any) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  const json = await response.json()

  return {
    id: json.id,
    total: json.price + json.price * TAX,
  }
}
```

Problems:

- `any` hides the input boundary.
- Fetching, parsing, and mapping are coupled.
- `TAX` is exported even if it is only a local implementation detail.
- External data is trusted without runtime checks.

### Good: explicit boundaries and local helpers

```ts
type CreateOrderInput = {
  productId: string
  quantity: number
}

type OrderDto = {
  id: string
  price: number
}

type Order = {
  id: string
  total: number
}

const TAX_RATE = 0.2

const mapOrder = (dto: OrderDto): Order => ({
  id: dto.id,
  total: dto.price + dto.price * TAX_RATE,
})

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  const dto = (await response.json()) as OrderDto

  return mapOrder(dto)
}
```

This is better because the public input/output boundary is typed, the mapper is local, and the exported API is intentional. Add runtime validation when the target project has a validation layer or when external data cannot be trusted.

## Naming

- Use descriptive names that express domain meaning or state.
- Prefer boolean names with state/capability prefixes, for example `isLoading`, `hasError`, `canSubmit`, `shouldRetry`.
- Use `Id` suffixes consistently for identifiers when the project follows that style.
- Avoid vague names such as `data`, `item`, `value`, or `result` when the domain shape is known.
- Keep constant names consistent with project convention. Do not force uppercase constants unless the project already uses that style for the same category.

### Bad: vague names

```ts
const data = await load()
const value = data.items[0]
const flag = value.count > 0
```

### Good: domain names

```ts
const invoice = await loadInvoice()
const firstLineItem = invoice.items[0]
const hasBillableItems = firstLineItem.count > 0
```

## Functions

- Prefer small functions with explicit inputs and outputs.
- Prefer early returns for invalid or completed states when they reduce nesting.
- Avoid boolean flag parameters when named options or discriminated unions make intent clearer.
- Keep pure transformations separate from side effects when practical.
- Keep generic helpers simple and justified by reuse.

### Bad: boolean flag API

```ts
const formatPrice = (amount: number, short: boolean): string => {
  if (short) {
    return `$${amount}`
  }

  return `USD ${amount.toFixed(2)}`
}
```

### Good: named mode through a union

```ts
type PriceFormat = 'compact' | 'full'

const formatPrice = (amount: number, format: PriceFormat): string => {
  if (format === 'compact') {
    return `$${amount}`
  }

  return `USD ${amount.toFixed(2)}`
}
```

## Types

- Use explicit types at public and integration boundaries.
- Let local values be inferred when inference is obvious.
- Use `unknown` for untrusted external input until narrowed.
- Prefer discriminated unions for variant state.
- Prefer literal unions or constant maps over broad string types.
- Avoid duplicate models for the same data shape unless they represent real boundaries.

### Bad: trusting external data and using `any`

```ts
const readUserName = (payload: any): string => {
  return payload.user.name.toUpperCase()
}
```

### Good: narrow `unknown` before use

```ts
type UserPayload = {
  user: {
    name: string
  }
}

const isUserPayload = (payload: unknown): payload is UserPayload => {
  if (typeof payload !== 'object' || payload === null) {
    return false
  }

  const candidate = payload as { user?: { name?: unknown } }

  return typeof candidate.user?.name === 'string'
}

const readUserName = (payload: unknown): string => {
  if (!isUserPayload(payload)) {
    throw new Error('Invalid user payload')
  }

  return payload.user.name.toUpperCase()
}
```

This follows TypeScript narrowing behavior: runtime checks refine broader types into more specific types before use.

### Bad: loosely related flags

```ts
type RequestState = {
  isLoading: boolean
  hasError: boolean
  data?: string[]
  error?: string
}
```

### Good: discriminated union

```ts
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; error: string }
```

The union prevents impossible states such as `isLoading: true` and `hasError: true` at the same time.

## Imports And Exports

- Preserve project import ordering and path alias conventions.
- Prefer type-only imports when the project/compiler setup expects them.
- Avoid barrel exports unless the project already uses them for stable public APIs.
- Do not change exported names or public type shapes without checking call sites.

### Bad: exporting implementation details

```ts
export const normalizeName = (name: string): string => name.trim()

export const createDisplayName = (firstName: string, lastName: string): string => {
  return normalizeName(`${firstName} ${lastName}`)
}
```

### Good: export the public API only

```ts
const normalizeName = (name: string): string => name.trim()

export const createDisplayName = (firstName: string, lastName: string): string => {
  return normalizeName(`${firstName} ${lastName}`)
}
```

## Async And Error Handling

- Await asynchronous work where the result is needed.
- Handle expected failures explicitly.
- Preserve project conventions for exceptions, result objects, nullable returns, or error objects.
- Do not swallow errors silently.
- Keep timeout, retry, cancellation, and fallback behavior explicit when relevant.

### Bad: swallowed error

```ts
const loadSettings = async (): Promise<Settings | undefined> => {
  try {
    return await settingsClient.load()
  } catch {
    return undefined
  }
}
```

### Good: explicit fallback policy

```ts
const loadSettings = async (): Promise<Settings> => {
  try {
    return await settingsClient.load()
  } catch (error) {
    logger.warn('Failed to load settings, using defaults', { error })
    return defaultSettings
  }
}
```

Use the target project's error/result convention instead of introducing a new one.

## Comments And Documentation

- Preserve project natural-language policy.
- Use comments to explain non-obvious decisions, invariants, and integration constraints.
- Do not add comments that repeat obvious code.
- Keep JSDoc/TSDoc style consistent with the existing project.

### Bad: obvious comment

```ts
// Increment count by one.
count += 1
```

### Good: explain invariant or boundary

```ts
// The backend stores timestamps in seconds; UI code expects milliseconds.
const createdAtMs = createdAtSeconds * 1000
```

## Formatting

- Formatting is owned by the project formatter and linter.
- Do not hardcode indentation, semicolons, quote style, or trailing comma policy in this skill.
- Use project-declared formatting and linting commands.
