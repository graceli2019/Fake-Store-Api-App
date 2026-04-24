# Carts API — Test Scenarios

**Base URL:** `https://fakestoreapi.com`
**Spec file:** `tests/api/carts.spec.ts`

---

## Happy Path

| TC | Method | Endpoint | Description | Expected Status |
|---|---|---|---|---|
| TC-01 | GET | `/carts` | Return all carts | 200 |
| TC-02 | GET | `/carts/:id` | Return single cart by ID | 200 |
| TC-03 | POST | `/carts` | Create a new cart | 200 |
| TC-04 | PUT | `/carts/:id` | Update an existing cart | 200 |
| TC-05 | DELETE | `/carts/:id` | Delete a cart | 200 |

**Assertions for TC-01 (GET all):**
- Response is a non-empty array
- Every cart has: `id` (number > 0), `userId` (number), `products` (array)

**Assertions for TC-02 (GET by ID):**
- `id` matches requested ID (1)
- `userId` is a positive number
- `products` is an array where every item has:
  - `productId` (number > 0)
  - `quantity` (number > 0)

**Assertions for TC-03 (POST):**
- Response includes numeric `id`
- `userId` matches submitted value
- `products` array has same length as submitted

**Assertions for TC-04 (PUT):**
- Response `id` matches updated cart (1)
- `userId` matches submitted value
- `products` array is present

**Assertions for TC-05 (DELETE):**
- Response includes numeric `id` of deleted cart

---

## Not Found

| TC | Method | Endpoint | Description | Expected Status |
|---|---|---|---|---|
| TC-06 | GET | `/carts/99999` | Non-existent cart ID | 404 |
| TC-07 | PUT | `/carts/99999` | Update non-existent cart | 404 |
| TC-08 | DELETE | `/carts/99999` | Delete non-existent cart | 404 |

---

## Invalid ID Format

| TC | Method | Endpoint | Description | Expected Status |
|---|---|---|---|---|
| TC-09 | GET | `/carts/abc` | Non-numeric string ID | 400 or 404 |
| TC-10 | GET | `/carts/-1` | Negative integer ID | 400 or 404 |

---

## Invalid POST Body

| TC | Method | Endpoint | Description | Input | Expected Status |
|---|---|---|---|---|---|
| TC-11 | POST | `/carts` | Missing all required fields | `{}` | not 200 |
| TC-12 | POST | `/carts` | Empty products array | `products: []` | not 200 |
| TC-13 | POST | `/carts` | Zero quantity | `quantity: 0` | not 200 |
| TC-14 | POST | `/carts` | Negative quantity | `quantity: -5` | not 200 |
| TC-15 | POST | `/carts` | Non-existent userId | `userId: 99999` | not 200 |
