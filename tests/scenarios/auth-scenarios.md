# Auth API — Test Scenarios

**Endpoint:** `POST /auth/login`
**Base URL:** `https://fakestoreapi.com`
**Spec file:** `tests/api/auth.spec.ts`

---

## Happy Path

| TC | Description | Input | Expected Status |
|---|---|---|---|
| TC-01 | Login with valid credentials | Valid username + password | 200 + JWT token |

**Assertions for TC-01:**
- Response body contains `token` key
- `token` is a string
- `token` matches JWT format: `header.payload.signature` (3 base64url segments)

---

## Invalid Credentials

| TC | Description | Input | Expected Status |
|---|---|---|---|
| TC-02 | Invalid credentials (lowercase) | `invaliduser` / `wrongpassword` | 401 |
| TC-03 | Invalid credentials (uppercase) | `INVALIDUSER` / `WRONGPASSWORD` | 401 |
| TC-04 | Invalid credentials (numbers only) | `123456` / `789012` | 401 |
| TC-05 | Invalid credentials (symbols only) | `!@#$%^` / `&*()_+` | 401 |
| TC-06 | Invalid credentials (mixed: uppercase + numbers + symbols) | `User123!` / `Pass@456#` | 401 |
| TC-07 | Valid username, wrong password | Valid username + `wrongpassword` | 401 |
| TC-08 | Wrong username, valid password | `unknownuser` + valid password | 401 |
| TC-09 | Valid username in wrong case (uppercase) | `MOR_2314` + valid password | 401 |

---

## Missing / Empty Fields

| TC | Description | Input | Expected Status |
|---|---|---|---|
| TC-10 | Missing username field | `{ password: "..." }` only | not 200 |
| TC-11 | Missing password field | `{ username: "..." }` only | not 200 |
| TC-12 | Empty string credentials | `username: ""`, `password: ""` | not 200 |
| TC-13 | Whitespace-only credentials | `username: "   "`, `password: "   "` | not 200 |
| TC-14 | Empty request body | `{}` | not 200 |
| TC-15 | Null credentials | `username: null`, `password: null` | not 200 |

---

## Boundary

| TC | Description | Input | Expected Status |
|---|---|---|---|
| TC-16 | Very long username and password (500 chars each) | `"aaa..."` x500 | not 200 |

---

## Extra Fields

| TC | Description | Input | Expected Status |
|---|---|---|---|
| TC-17 | Valid credentials + unknown extra fields | Valid credentials + `role: "admin"`, `isAdmin: true` | 200 + JWT token |

---

## Security

| TC | Description | Input | Expected Status |
|---|---|---|---|
| TC-18 | SQL injection in credentials | `' OR '1'='1` / `' OR '1'='1` | 401 |
| TC-19 | Script injection in credentials | `<script>alert(1)</script>` in both fields | 401 |
