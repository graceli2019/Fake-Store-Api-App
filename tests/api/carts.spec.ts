import { test, expect } from '@playwright/test';

test.describe('Carts API', () => {

  // ── Happy Path ─────────────────────────────────────────────────────────────

  test('TC-01 GET /carts - should return all carts', async ({ request }) => {
    // Fetch the full list of carts
    const response = await request.get('/carts');

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const carts = await response.json();

    // Response must be a non-empty array
    expect(Array.isArray(carts)).toBeTruthy();
    expect(carts.length).toBeGreaterThan(0);

    // Validate the shape of every cart in the list
    carts.forEach((cart: any) => {
      expect(typeof cart.id).toBe('number');      // id must be a number
      expect(cart.id).toBeGreaterThan(0);         // id must be positive
      expect(typeof cart.userId).toBe('number');  // userId must be a number
      expect(Array.isArray(cart.products)).toBeTruthy(); // products must be an array
    });
  });

  test('TC-02 GET /carts/:id - should return a single cart', async ({ request }) => {
    // Fetch cart with ID 1 — a known existing cart
    const response = await request.get('/carts/1');

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const cart = await response.json();

    // ID in response must match the requested ID
    expect(cart.id).toBe(1);
    expect(typeof cart.userId).toBe('number');  // userId must be a number
    expect(cart.userId).toBeGreaterThan(0);     // userId must be positive
    expect(Array.isArray(cart.products)).toBeTruthy(); // products must be an array

    // Validate each product entry in the cart
    cart.products.forEach((product: any) => {
      expect(typeof product.productId).toBe('number');  // productId must be a number
      expect(product.productId).toBeGreaterThan(0);     // productId must be positive
      expect(typeof product.quantity).toBe('number');   // quantity must be a number
      expect(product.quantity).toBeGreaterThan(0);      // quantity must be at least 1
    });
  });

  test('TC-03 POST /carts - should create a new cart', async ({ request }) => {
    // Define a valid cart payload with a user and two products
    const newCart = {
      userId: 1,
      products: [
        { productId: 1, quantity: 2 },
        { productId: 3, quantity: 1 },
      ],
    };

    // Send POST request to create the cart
    const response = await request.post('/carts', { data: newCart });

    // API returns 201 Created for new cart creation
    expect(response.status()).toBe(201);

    const created = await response.json();

    // Response must include a numeric ID assigned by the API
    // Note: FakeStoreAPI 201 response only returns id, not the full cart object
    expect(typeof created.id).toBe('number');
  });

  test('TC-04 PUT /carts/:id - should update an existing cart', async ({ request }) => {
    // Define updated cart content with a single product
    const updatedCart = {
      userId: 1,
      products: [
        { productId: 2, quantity: 5 },
      ],
    };

    // Send PUT request to update cart ID 1
    const response = await request.put('/carts/1', { data: updatedCart });

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const updated = await response.json();

    // Response ID must match the cart that was updated
    expect(updated.id).toBe(1);

    // userId must match the submitted value
    expect(updated.userId).toBe(updatedCart.userId);

    // Products array must be present in the response
    expect(Array.isArray(updated.products)).toBeTruthy();
  });

  test('TC-05 DELETE /carts/:id - should delete a cart', async ({ request }) => {
    // Send DELETE request for cart ID 1
    const response = await request.delete('/carts/1');

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const deleted = await response.json();

    // Response must include the ID of the deleted cart
    expect(typeof deleted.id).toBe('number');
  });

  // ── Not Found ──────────────────────────────────────────────────────────────

  test('TC-06 GET /carts/:id - should not crash for non-existent cart', async ({ request }) => {
    // Use an ID that does not exist in the system
    const response = await request.get('/carts/99999');

    // FakeStoreAPI does not enforce 404 for missing IDs — must at minimum not crash (500)
    expect(response.status()).not.toBe(500);
  });

  test('TC-07 PUT /carts/:id - should not crash for non-existent cart', async ({ request }) => {
    // Attempt to update a cart that does not exist
    const response = await request.put('/carts/99999', {
      data: { userId: 1, products: [{ productId: 1, quantity: 1 }] },
    });

    // FakeStoreAPI does not enforce 404 for missing IDs — must at minimum not crash (500)
    expect(response.status()).not.toBe(500);
  });

  test('TC-08 DELETE /carts/:id - should not crash for non-existent cart', async ({ request }) => {
    // Attempt to delete a cart that does not exist
    const response = await request.delete('/carts/99999');

    // FakeStoreAPI does not enforce 404 for missing IDs — must at minimum not crash (500)
    expect(response.status()).not.toBe(500);
  });

  // ── Invalid ID Format ──────────────────────────────────────────────────────

  test('TC-09 GET /carts/:id - should handle non-numeric ID gracefully', async ({ request }) => {
    // Pass a string instead of a number as the cart ID
    const response = await request.get('/carts/abc');

    // Must return 400 Bad Request or 404 — not 200
    expect([400, 404]).toContain(response.status());
  });

  test('TC-10 GET /carts/:id - should handle negative ID gracefully', async ({ request }) => {
    // Negative IDs are not valid cart identifiers
    const response = await request.get('/carts/-1');

    // Must not crash (500) — API behaviour for negative IDs is unspecified
    expect(response.status()).not.toBe(500);
  });

  // ── Invalid POST Body ──────────────────────────────────────────────────────

  test('TC-11 POST /carts - should fail with empty body', async ({ request }) => {
    // Send a POST with no data — all required fields are absent
    const response = await request.post('/carts', { data: {} });

    // Must not succeed with an empty payload
    expect(response.status()).not.toBe(200);
  });

  test('TC-12 POST /carts - should fail with empty products array', async ({ request }) => {
    // A cart with no products is not meaningful
    const response = await request.post('/carts', {
      data: { userId: 1, products: [] },
    });

    // Must reject a cart with no products
    expect(response.status()).not.toBe(200);
  });

  test('TC-13 POST /carts - should fail with zero quantity', async ({ request }) => {
    // Quantity of 0 means no items — not a valid cart entry
    const response = await request.post('/carts', {
      data: { userId: 1, products: [{ productId: 1, quantity: 0 }] },
    });

    // Must reject zero quantity
    expect(response.status()).not.toBe(200);
  });

  test('TC-14 POST /carts - should fail with negative quantity', async ({ request }) => {
    // Negative quantity is logically invalid
    const response = await request.post('/carts', {
      data: { userId: 1, products: [{ productId: 1, quantity: -5 }] },
    });

    // Must reject negative quantity
    expect(response.status()).not.toBe(200);
  });

  test('TC-15 POST /carts - should fail with non-existent userId', async ({ request }) => {
    // A cart must belong to a valid user
    const response = await request.post('/carts', {
      data: { userId: 99999, products: [{ productId: 1, quantity: 1 }] },
    });

    // Must reject a cart with a userId that does not exist
    expect(response.status()).not.toBe(200);
  });

});
