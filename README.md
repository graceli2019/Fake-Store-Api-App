# Fake Store API — Playwright Test Suite

Automated API test framework for [fakestoreapi.com](https://fakestoreapi.com) built with [Playwright](https://playwright.dev) and TypeScript.

---

## Project Structure

```
Fake-Store-Api-App/
├── tests/
│   ├── api/                        # Executable test specs
│   │   ├── auth.spec.ts            # Auth endpoint (19 TCs)
│   │   ├── products.spec.ts        # Products endpoint (14 TCs)
│   │   ├── carts.spec.ts           # Carts endpoint (15 TCs)
│   │   └── users.spec.ts           # Users endpoint (17 TCs)
│   └── scenarios/                  # Human-readable test scenario docs
│       ├── auth-scenarios.md
│       ├── products-scenarios.md
│       ├── carts-scenarios.md
│       └── users-scenarios.md
├── .github/
│   ├── workflows/
│   │   └── playwright.yml          # GitHub Actions CI pipeline
│   └── prompts/                    # Reusable Copilot Chat prompts
│       ├── playwright-conventions.prompt.md
│       ├── api-test-reviewer.prompt.md
│       └── api-test-writer.prompt.md
├── playwright.config.ts            # Playwright configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json
```

---

## Tech Stack

| Tool | Version |
|---|---|
| [Playwright Test](https://playwright.dev) | ^1.59.1 |
| TypeScript | via `@types/node` |
| Node.js | LTS |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install
```

### 3. Run all tests

```bash
npx playwright test
```

### 4. Run a specific spec file

```bash
npx playwright test tests/api/auth.spec.ts
```

### 5. View the HTML report

```bash
npx playwright show-report
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `API_BASE_URL` | `https://fakestoreapi.com` | Base URL for all API requests |
| `API_USERNAME` | `mor_2314` | Username for auth tests |
| `API_PASSWORD` | `83r5^_` | Password for auth tests |

To override, create a `.env` file or set them in your shell before running tests:

```bash
API_USERNAME=myuser API_PASSWORD=mypass npx playwright test
```

---

## Test Coverage

| Spec | TCs | Sections |
|---|---|---|
| `auth.spec.ts` | 19 | Happy Path, Invalid Credentials, Missing/Empty Fields, Boundary, Extra Fields, Security |
| `products.spec.ts` | 14 | Happy Path, Not Found, Invalid ID Format, Invalid POST Body, Boundary |
| `carts.spec.ts` | 15 | Happy Path, Not Found, Invalid ID Format, Invalid POST Body |
| `users.spec.ts` | 17 | Happy Path, Not Found, Invalid ID Format, Invalid POST Body, Boundary |
| **Total** | **65** | |

> **Note:** 5 tests in `users.spec.ts` (TC-11 to TC-15) are marked `test.fixme()` because FakeStoreAPI does not enforce input validation. These tests document expected behavior for a production-grade API.

---

## CI/CD

GitHub Actions runs automatically on push or pull request to `main`, `master`, or `dev` branches.

Workflow file: [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)

The pipeline:
1. Checks out the code
2. Installs Node.js (LTS)
3. Runs `npm ci`
4. Installs Playwright browsers
5. Runs all tests
6. Uploads the HTML report as an artifact (retained for 30 days)

---

## API Under Test

Base URL: `https://fakestoreapi.com`

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/login` |
| Products | `GET/POST /products`, `GET/PUT/DELETE /products/:id` |
| Carts | `GET/POST /carts`, `GET/PUT/DELETE /carts/:id` |
| Users | `GET/POST /users`, `GET/PUT/DELETE /users/:id` |
