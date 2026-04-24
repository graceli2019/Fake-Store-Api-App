# Products API — Test Scenarios

**Base URL:** `https://fakestoreapi.com`
**Spec file:** `tests/api/products.spec.ts`

---

## Happy Path

| TC | Method | Endpoint | Description | Expected Status |
|---|---|---|---|---|
| TC-01 | GET | `/products` | Return all products | 200 |
| TC-02 | GET | `/products/:id` | Return single product by ID | 200 |
| TC-03 | POST | `/products` | Create a new product | 200 |
| TC-04 | PUT | `/products/:id` | Update an existing product | 200 |
| TC-05 | DELETE | `/products/:id` | Delete a product | 200 |

**Assertions for TC-01 (GET all):**
- Response is a non-empty array
- Every item has: `id` (number > 0), `title` (non-empty string), `price` (number > 0), `category` (string), `description` (string), `image` (string)

**Assertions for TC-02 (GET by ID):**
- `id` matches requested ID (1)
- All fields present with correct types and positive values

**Assertions for TC-03 (POST):**
- Response includes numeric `id`
- All submitted fields echoed back: `title`, `price`, `description`, `category`, `image`

**Assertions for TC-04 (PUT):**
- Response `id` matches updated product (1)
- Updated fields reflected: `title`, `price`, `description`, `category`

**Assertions for TC-05 (DELETE):**
- Response includes numeric `id` of deleted product

---

## Not Found

| TC | Method | Endpoint | Description | Expected Status |
|---|---|---|---|---|
| TC-06 | GET | `/products/99999` | Non-existent product ID | 404 |
| TC-07 | PUT | `/products/99999` | Update non-existent product | 404 |
| TC-08 | DELETE | `/products/99999` | Delete non-existent product | 404 |

---

## Invalid ID Format

| TC | Method | Endpoint | Description | Expected Status |
|---|---|---|---|---|
| TC-09 | GET | `/products/abc` | Non-numeric string ID | 400 or 404 |
| TC-10 | GET | `/products/-1` | Negative integer ID | 400 or 404 |

---

## Invalid POST Body

| TC | Method | Endpoint | Description | Input | Expected Status |
|---|---|---|---|---|---|
| TC-11 | POST | `/products` | Missing all required fields | `{}` | not 200 |
| TC-12 | POST | `/products` | Negative price value | `price: -10` | not 200 |
| TC-13 | POST | `/products` | Empty title string | `title: ""` | not 200 |

---

## Boundary

| TC | Method | Endpoint | Description | Input | Expected Status |
|---|---|---|---|---|---|
| TC-14 | POST | `/products` | Very long title (500 chars) | `title: "aaa..."` x500 | 200 or 400 (must not be 500) |
