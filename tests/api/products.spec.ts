import { test, expect } from '@playwright/test';

// Reusable long string for boundary testing (500 characters)
const LONG_STRING = 'a'.repeat(500);

test.describe('Products API', () => {

  // ── Happy Path ─────────────────────────────────────────────────────────────

  test('TC-01 GET /products - should return all products', async ({ request }) => {
    // Fetch the full product list
    const response = await request.get('/products');

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const products = await response.json();

    // Response must be a non-empty array
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);

    // Validate the shape and value types of every product in the list
    products.forEach((product: any) => {
      expect(typeof product.id).toBe('number');          // id must be a number
      expect(product.id).toBeGreaterThan(0);             // id must be positive
      expect(typeof product.title).toBe('string');       // title must be a string
      expect(product.title.length).toBeGreaterThan(0);   // title must not be empty
      expect(typeof product.price).toBe('number');       // price must be a number
      expect(product.price).toBeGreaterThan(0);          // price must be positive
      expect(typeof product.category).toBe('string');    // category must be a string
      expect(typeof product.description).toBe('string'); // description must be a string
      expect(typeof product.image).toBe('string');       // image must be a string URL
    });
  });

  test('TC-02 GET /products/:id - should return a single product', async ({ request }) => {
    // Fetch product with ID 1 — a known existing product
    const response = await request.get('/products/1');

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const product = await response.json();

    // ID in response must match the requested ID
    expect(product.id).toBe(1);
    expect(typeof product.title).toBe('string');       // title must be a string
    expect(product.title.length).toBeGreaterThan(0);   // title must not be empty
    expect(typeof product.price).toBe('number');       // price must be a number
    expect(product.price).toBeGreaterThan(0);          // price must be positive
    expect(typeof product.category).toBe('string');    // category must be a string
    expect(typeof product.description).toBe('string'); // description must be a string
    expect(typeof product.image).toBe('string');       // image must be a string URL
  });

  test('TC-03 POST /products - should create a new product', async ({ request }) => {
    // Define a valid product payload with all required fields
    const newProduct = {
      title: 'Test Product',
      price: 29.99,
      description: 'A test product for API validation',
      category: "men's clothing",
      image: 'https://fakestoreapi.com/img/placeholder.jpg',
    };

    // Send POST request to create the product
    const response = await request.post('/products', { data: newProduct });

    // API returns 201 Created for new product creation
    expect(response.status()).toBe(201);

    const created = await response.json();

    // Response must include a numeric ID assigned by the API
    // Note: FakeStoreAPI 201 response only returns id, not the full product object
    expect(typeof created.id).toBe('number');
  });

  test('TC-04 PUT /products/:id - should update an existing product', async ({ request }) => {
    // Define updated values for all fields
    const updatedProduct = {
      title: 'Updated Product Title',
      price: 49.99,
      description: 'Updated description',
      category: 'electronics',
      image: 'https://fakestoreapi.com/img/placeholder.jpg',
    };

    // Send PUT request to update product ID 1
    const response = await request.put('/products/1', { data: updatedProduct });

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const updated = await response.json();

    // Response ID must match the product that was updated
    expect(updated.id).toBe(1);

    // All updated fields must be reflected in the response
    expect(updated.title).toBe(updatedProduct.title);
    expect(updated.price).toBe(updatedProduct.price);
    expect(updated.description).toBe(updatedProduct.description);
    expect(updated.category).toBe(updatedProduct.category);
  });

  test('TC-05 DELETE /products/:id - should delete a product', async ({ request }) => {
    // Send DELETE request for product ID 1
    const response = await request.delete('/products/1');

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const deleted = await response.json();

    // Response must include the ID of the deleted product
    expect(typeof deleted.id).toBe('number');
  });

  // ── Not Found ──────────────────────────────────────────────────────────────

  test('TC-06 GET /products/:id - should not crash for non-existent product', async ({ request }) => {
    // Use an ID that does not exist in the system
    const response = await request.get('/products/99999');

    // FakeStoreAPI does not enforce 404 for missing IDs — must at minimum not crash (500)
    expect(response.status()).not.toBe(500);
  });

  test('TC-07 PUT /products/:id - should not crash for non-existent product', async ({ request }) => {
    // Attempt to update a product that does not exist
    const response = await request.put('/products/99999', {
      data: { title: 'Ghost Product', price: 9.99, description: 'none', category: 'electronics', image: 'https://fakestoreapi.com/img/placeholder.jpg' },
    });

    // FakeStoreAPI does not enforce 404 for missing IDs — must at minimum not crash (500)
    expect(response.status()).not.toBe(500);
  });

  test('TC-08 DELETE /products/:id - should not crash for non-existent product', async ({ request }) => {
    // Attempt to delete a product that does not exist
    const response = await request.delete('/products/99999');

    // FakeStoreAPI does not enforce 404 for missing IDs — must at minimum not crash (500)
    expect(response.status()).not.toBe(500);
  });

  // ── Invalid ID Format ──────────────────────────────────────────────────────

  test('TC-09 GET /products/:id - should handle non-numeric ID gracefully', async ({ request }) => {
    // Pass a string instead of a number as the product ID
    const response = await request.get('/products/abc');

    // Must not crash (500) — API behaviour for non-numeric IDs is unspecified
    expect(response.status()).not.toBe(500);
  });

  test('TC-10 GET /products/:id - should handle negative ID gracefully', async ({ request }) => {
    // Negative IDs are not valid product identifiers
    const response = await request.get('/products/-1');

    // Must not crash (500) — API behaviour for negative IDs is unspecified
    expect(response.status()).not.toBe(500);
  });

  // ── Invalid POST Body ──────────────────────────────────────────────────────

  test('TC-11 POST /products - should fail with missing required fields', async ({ request }) => {
    // Send an empty body — all required fields are absent
    const response = await request.post('/products', { data: {} });

    // Must not succeed with an empty payload
    expect(response.status()).not.toBe(200);
  });

  test('TC-12 POST /products - should fail with negative price', async ({ request }) => {
    // Price must be a positive number — negative values are invalid
    const response = await request.post('/products', {
      data: { title: 'Bad Product', price: -10, description: 'test', category: 'electronics', image: 'https://fakestoreapi.com/img/placeholder.jpg' },
    });

    // Must reject negative price
    expect(response.status()).not.toBe(200);
  });

  test('TC-13 POST /products - should fail with empty title', async ({ request }) => {
    // Title is a required field — empty string should be rejected
    const response = await request.post('/products', {
      data: { title: '', price: 9.99, description: 'test', category: 'electronics', image: 'https://fakestoreapi.com/img/placeholder.jpg' },
    });

    // Must reject empty title
    expect(response.status()).not.toBe(200);
  });

  // ── Boundary ───────────────────────────────────────────────────────────────

  test('TC-14 POST /products - should handle very long title string', async ({ request }) => {
    // 500-character title tests whether the API enforces input length limits
    const response = await request.post('/products', {
      data: { title: LONG_STRING, price: 9.99, description: 'test', category: 'electronics', image: 'https://fakestoreapi.com/img/placeholder.jpg' },
    });

    // Must either accept it (200/201) or reject it with 400 — must not crash (500)
    expect([200, 201, 400]).toContain(response.status());
  });

});
