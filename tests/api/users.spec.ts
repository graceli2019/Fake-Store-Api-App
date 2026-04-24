import { test, expect } from '@playwright/test';

// Regex to validate standard email format: local@domain.tld
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reusable long string for boundary testing (500 characters)
const LONG_STRING = 'a'.repeat(500);

test.describe('Users API', () => {

  // ── Happy Path ─────────────────────────────────────────────────────────────

  test('TC-01 GET /users - should return all users', async ({ request }) => {
    // Fetch the full list of users
    const response = await request.get('/users');

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const users = await response.json();

    // Response must be a non-empty array
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);

    // Validate the shape and value types of every user in the list
    users.forEach((user: any) => {
      expect(typeof user.id).toBe('number');        // id must be a number
      expect(user.id).toBeGreaterThan(0);           // id must be positive
      expect(typeof user.username).toBe('string');  // username must be a string
      expect(user.username.length).toBeGreaterThan(0); // username must not be empty
      expect(typeof user.email).toBe('string');     // email must be a string
      expect(user.email).toMatch(EMAIL_REGEX);      // email must be a valid format
    });
  });

  test('TC-02 GET /users/:id - should return a single user', async ({ request }) => {
    // Fetch user with ID 1 — a known existing user
    const response = await request.get('/users/1');

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const user = await response.json();

    // ID in response must match the requested ID
    expect(user.id).toBe(1);
    expect(typeof user.username).toBe('string');     // username must be a string
    expect(user.username.length).toBeGreaterThan(0); // username must not be empty
    expect(typeof user.email).toBe('string');        // email must be a string
    expect(user.email).toMatch(EMAIL_REGEX);         // email must be a valid format
  });

  test('TC-03 POST /users - should create a new user', async ({ request }) => {
    // Define a valid user payload with all required fields
    const newUser = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'TestPass123!',
    };

    // Send POST request to create the user
    const response = await request.post('/users', { data: newUser });

    // API returns 201 Created for new user creation
    expect(response.status()).toBe(201);

    const created = await response.json();

    // Response must include a numeric ID assigned by the API
    // Note: FakeStoreAPI 201 response only returns id, not the full user object
    expect(typeof created.id).toBe('number');
  });

  test('TC-04 PUT /users/:id - should update an existing user', async ({ request }) => {
    // Define updated values for the user fields
    const updatedUser = {
      username: 'updateduser',
      email: 'updated@example.com',
      password: 'UpdatedPass123!',
    };

    // Send PUT request to update user ID 1
    const response = await request.put('/users/1', { data: updatedUser });

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const updated = await response.json();

    // Updated username and email must be reflected in the response
    expect(updated.username).toBe(updatedUser.username);
    expect(updated.email).toBe(updatedUser.email);
  });

  test('TC-05 DELETE /users/:id - should delete a user', async ({ request }) => {
    // Send DELETE request for user ID 1
    const response = await request.delete('/users/1');

    // Expect HTTP 200 OK
    expect(response.status()).toBe(200);

    const deleted = await response.json();

    // Response must include the ID of the deleted user
    expect(typeof deleted.id).toBe('number');
  });

  // ── Not Found ──────────────────────────────────────────────────────────────

  test('TC-06 GET /users/:id - should not crash for non-existent user', async ({ request }) => {
    // Use an ID that does not exist in the system
    const response = await request.get('/users/99999');

    // FakeStoreAPI does not enforce 404 for missing IDs — must at minimum not crash (500)
    expect(response.status()).not.toBe(500);
  });

  test('TC-07 PUT /users/:id - should not crash for non-existent user', async ({ request }) => {
    // Attempt to update a user that does not exist
    const response = await request.put('/users/99999', {
      data: { username: 'ghost', email: 'ghost@example.com', password: 'Ghost123!' },
    });

    // FakeStoreAPI does not enforce 404 for missing IDs — must at minimum not crash (500)
    expect(response.status()).not.toBe(500);
  });

  test('TC-08 DELETE /users/:id - should not crash for non-existent user', async ({ request }) => {
    // Attempt to delete a user that does not exist
    const response = await request.delete('/users/99999');

    // FakeStoreAPI does not enforce 404 for missing IDs — must at minimum not crash (500)
    expect(response.status()).not.toBe(500);
  });

  // ── Invalid ID Format ──────────────────────────────────────────────────────

  test('TC-09 GET /users/:id - should handle non-numeric ID gracefully', async ({ request }) => {
    // Pass a string instead of a number as the user ID
    const response = await request.get('/users/abc');

    // Must return 400 Bad Request or 404 — not 200
    expect([400, 404]).toContain(response.status());
  });

  test('TC-10 GET /users/:id - should handle negative ID gracefully', async ({ request }) => {
    // Negative IDs are not valid user identifiers
    const response = await request.get('/users/-1');

    // Must not crash (500) — API behaviour for negative IDs is unspecified
    expect(response.status()).not.toBe(500);
  });

  // ── Invalid POST Body ──────────────────────────────────────────────────────

  test('TC-11 POST /users - should fail with missing required fields', async ({ request }) => {
    // FIXME: FakeStoreAPI accepts any payload without validation — returns 201 for empty body.
    // In a real API, this should be rejected (400/422). Skipped until proper validation is enforced.
    test.fixme();

    // Send an empty body — all required fields are absent
    const response = await request.post('/users', { data: {} });

    // Must not succeed with an empty payload (reject 200 and 201)
    expect([200, 201]).not.toContain(response.status());
  });

  test('TC-12 POST /users - should fail with invalid email format', async ({ request }) => {
    // FIXME: FakeStoreAPI does not validate email format — accepts any string as email.
    // In a real API, this should be rejected. Skipped until proper validation is enforced.
    test.fixme();

    // Email without @ symbol is not a valid email address
    const response = await request.post('/users', {
      data: { username: 'testuser', email: 'notanemail', password: 'TestPass123!' },
    });

    // Must reject invalid email format (reject 200 and 201)
    expect([200, 201]).not.toContain(response.status());
  });

  test('TC-13 POST /users - should fail with empty username', async ({ request }) => {
    // FIXME: FakeStoreAPI does not reject empty username — accepts blank strings.
    // In a real API, this should be rejected. Skipped until proper validation is enforced.
    test.fixme();

    // Username is a required field — empty string should be rejected
    const response = await request.post('/users', {
      data: { username: '', email: 'test@example.com', password: 'TestPass123!' },
    });

    // Must reject empty username (reject 200 and 201)
    expect([200, 201]).not.toContain(response.status());
  });

  test('TC-14 POST /users - should fail with empty email', async ({ request }) => {
    // FIXME: FakeStoreAPI does not reject empty email — accepts blank strings.
    // In a real API, this should be rejected. Skipped until proper validation is enforced.
    test.fixme();

    // Email is a required field — empty string should be rejected
    const response = await request.post('/users', {
      data: { username: 'testuser', email: '', password: 'TestPass123!' },
    });

    // Must reject empty email (reject 200 and 201)
    expect([200, 201]).not.toContain(response.status());
  });

  test('TC-15 POST /users - should fail with empty password', async ({ request }) => {
    // FIXME: FakeStoreAPI does not reject empty password — accepts blank strings.
    // In a real API, this should be rejected. Skipped until proper validation is enforced.
    test.fixme();

    // Password is a required field — empty string should be rejected
    const response = await request.post('/users', {
      data: { username: 'testuser', email: 'test@example.com', password: '' },
    });

    // Must reject empty password (reject 200 and 201)
    expect([200, 201]).not.toContain(response.status());
  });

  // ── Boundary ───────────────────────────────────────────────────────────────

  test('TC-16 POST /users - should handle very long username', async ({ request }) => {
    // 500-character username tests whether the API enforces input length limits
    const response = await request.post('/users', {
      data: { username: LONG_STRING, email: 'long@example.com', password: 'TestPass123!' },
    });

    // Must either accept it (200/201) or reject it with 400 — must not crash (500)
    expect([200, 201, 400]).toContain(response.status());
  });

  test('TC-17 POST /users - should handle very long email', async ({ request }) => {
    // 500-character email tests whether the API enforces input length limits
    const response = await request.post('/users', {
      data: { username: 'testuser', email: `${LONG_STRING}@example.com`, password: 'TestPass123!' },
    });

    // Must either accept it (200/201) or reject it with 400 — must not crash (500)
    expect([200, 201, 400]).toContain(response.status());
  });

});
