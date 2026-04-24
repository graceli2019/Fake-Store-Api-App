# Users API — Test Scenarios

**Base URL:** `https://fakestoreapi.com`
**Spec file:** `tests/api/users.spec.ts`

---

## Happy Path

| TC | Method | Endpoint | Description | Expected Status |
|---|---|---|---|---|
| TC-01 | GET | `/users` | Return all users | 200 |
| TC-02 | GET | `/users/:id` | Return single user by ID | 200 |
| TC-03 | POST | `/users` | Create a new user | 200 |
| TC-04 | PUT | `/users/:id` | Update an existing user | 200 |
| TC-05 | DELETE | `/users/:id` | Delete a user | 200 |

**Assertions for TC-01 (GET all):**
- Response is a non-empty array
- Every user has: `id` (number > 0), `username` (non-empty string), `email` (valid format matching `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)

**Assertions for TC-02 (GET by ID):**
- `id` matches requested ID (1)
- `username` is a non-empty string
- `email` matches email regex

**Assertions for TC-03 (POST):**
- Response includes numeric `id`
- `username` and `email` match submitted values

**Assertions for TC-04 (PUT):**
- Response `id` matches updated user (1)
- Updated `username` and `email` reflected in response

**Assertions for TC-05 (DELETE):**
- Response includes numeric `id` of deleted user

---

## Not Found

| TC | Method | Endpoint | Description | Expected Status |
|---|---|---|---|---|
| TC-06 | GET | `/users/99999` | Non-existent user ID | 404 |
| TC-07 | PUT | `/users/99999` | Update non-existent user | 404 |
| TC-08 | DELETE | `/users/99999` | Delete non-existent user | 404 |

---

## Invalid ID Format

| TC | Method | Endpoint | Description | Expected Status |
|---|---|---|---|---|
| TC-09 | GET | `/users/abc` | Non-numeric string ID | 400 or 404 |
| TC-10 | GET | `/users/-1` | Negative integer ID | 400 or 404 |

---

## Invalid POST Body

| TC | Method | Endpoint | Description | Input | Expected Status |
|---|---|---|---|---|---|
| TC-11 | POST | `/users` | Missing all required fields | `{}` | not 200 |
| TC-12 | POST | `/users` | Invalid email format (no @) | `email: "notanemail"` | not 200 |
| TC-13 | POST | `/users` | Empty username | `username: ""` | not 200 |
| TC-14 | POST | `/users` | Empty email | `email: ""` | not 200 |
| TC-15 | POST | `/users` | Empty password | `password: ""` | not 200 |

---

## Boundary

| TC | Method | Endpoint | Description | Input | Expected Status |
|---|---|---|---|---|---|
| TC-16 | POST | `/users` | Very long username (500 chars) | `username: "aaa..."` x500 | 200 or 400 (must not be 500) |
| TC-17 | POST | `/users` | Very long email (500 chars + domain) | `email: "aaa...@example.com"` | 200 or 400 (must not be 500) |
