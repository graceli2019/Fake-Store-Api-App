---
mode: agent
description: Shared Playwright API testing conventions for the Fake Store API project
---

# Playwright API Testing Conventions

## Project Setup
- Framework: Playwright Test with TypeScript
- Base URL: configured in `playwright.config.ts` via `process.env.API_BASE_URL || 'https://fakestoreapi.com'`
- Tests live in `tests/api/`, one file per API resource
- `fullyParallel: false` to prevent test data interference

## Test Structure
- Use `test.describe('Resource API', () => { ... })` to group tests by resource
- One `test()` per scenario — do not combine multiple assertions for different behaviours
- Test names follow the pattern: `METHOD /endpoint - should <expected behaviour>`
  - Example: `GET /products/:id - should return 404 for non-existent product`

## Assertions
- Always assert the HTTP status code first before parsing the body
- Use specific status codes — never `not.toBe(200)` for negative tests; use the exact code (401, 404, 400)
- Assert values, not just presence:
  - ❌ `expect(product).toHaveProperty('price')`
  - ✅ `expect(product.price).toBeGreaterThan(0)`
- For arrays, validate every item with `.forEach()`, not just `[0]`
- Use type assertions: `expect(typeof field).toBe('number')` alongside value assertions
- Validate string formats with regex where applicable (email, JWT)

## Negative / Edge Case Tests
Every resource must include:
- `GET /:id` with a non-existent ID → expect `404`
- `POST` with missing required fields → expect non-200
- `POST /auth/login` with invalid credentials → expect `401`

## Credentials & Secrets
- Never hardcode credentials in test files
- Use `process.env.VARIABLE_NAME || 'fallback'` pattern
- Env var names: `API_BASE_URL`, `API_USERNAME`, `API_PASSWORD`

## TypeScript
- Annotate inline response types as `any` only when no interface exists
- Prefer creating interfaces in a `types/` folder for reused shapes
- `tsconfig.json` must include `"types": ["node"]`
