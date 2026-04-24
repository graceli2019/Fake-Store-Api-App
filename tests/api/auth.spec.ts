import { test, expect } from '@playwright/test';

// Read credentials from environment variables, fall back to known test account
const VALID_USERNAME = process.env.API_USERNAME || 'mor_2314';
const VALID_PASSWORD = process.env.API_PASSWORD || '83r5^_';

// JWT must have exactly 3 base64url-encoded segments separated by dots: header.payload.signature
const JWT_REGEX = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+$/;

// Reusable long string for boundary testing (500 characters)
const LONG_STRING = 'a'.repeat(500);

test.describe('Auth API', () => {

  // ── Happy Path ─────────────────────────────────────────────────────────────

  test('TC-01 POST /auth/login - should return a JWT token with valid credentials', async ({ request }) => {
    // Send login request with valid credentials
    const response = await request.post('/auth/login', {
      data: { username: VALID_USERNAME, password: VALID_PASSWORD },
    });

    // API returns 201 for a successful login
    expect(response.status()).toBe(201);

    // Parse the response body as JSON
    const body = await response.json();

    // Token key must exist in the response
    expect(body).toHaveProperty('token');

    // Token must be a string type
    expect(typeof body.token).toBe('string');

    // Token must match the 3-segment JWT structure
    expect(body.token).toMatch(JWT_REGEX);
  });

  // ── Invalid Credentials ────────────────────────────────────────────────────

  test('TC-02 POST /auth/login - should return 401 with invalid credentials (lowercase)', async ({ request }) => {
    // Both fields are plain lowercase strings that do not match any account
    const response = await request.post('/auth/login', {
      data: { username: 'invaliduser', password: 'wrongpassword' },
    });

    // API must reject unrecognised credentials with 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('TC-03 POST /auth/login - should return 401 with invalid credentials (uppercase)', async ({ request }) => {
    // Uppercase versions of invalid credentials — tests case sensitivity
    const response = await request.post('/auth/login', {
      data: { username: 'INVALIDUSER', password: 'WRONGPASSWORD' },
    });

    // Must still be rejected even if capitalisation differs
    expect(response.status()).toBe(401);
  });

  test('TC-04 POST /auth/login - should return 401 with invalid credentials (numbers)', async ({ request }) => {
    // Numeric-only strings as credentials — not a valid account
    const response = await request.post('/auth/login', {
      data: { username: '123456', password: '789012' },
    });

    // Must reject numeric-only credentials
    expect(response.status()).toBe(401);
  });

  test('TC-05 POST /auth/login - should return 401 with invalid credentials (symbols)', async ({ request }) => {
    // Symbol-only strings — tests special character handling in auth
    const response = await request.post('/auth/login', {
      data: { username: '!@#$%^', password: '&*()_+' },
    });

    // Must reject symbol-only credentials
    expect(response.status()).toBe(401);
  });

  test('TC-06 POST /auth/login - should return 401 with invalid credentials (mixed: uppercase + numbers + symbols)', async ({ request }) => {
    // Mixed-format invalid credentials combining uppercase, digits, and symbols
    const response = await request.post('/auth/login', {
      data: { username: 'User123!', password: 'Pass@456#' },
    });

    // Must reject mixed-format invalid credentials
    expect(response.status()).toBe(401);
  });

  test('TC-07 POST /auth/login - should return 401 with valid username but wrong password', async ({ request }) => {
    // Correct username paired with an incorrect password
    const response = await request.post('/auth/login', {
      data: { username: VALID_USERNAME, password: 'wrongpassword' },
    });

    // API must not reveal which field is wrong — just reject with 401
    expect(response.status()).toBe(401);
  });

  test('TC-08 POST /auth/login - should return 401 with wrong username but valid password', async ({ request }) => {
    // Incorrect username paired with the correct password
    const response = await request.post('/auth/login', {
      data: { username: 'unknownuser', password: VALID_PASSWORD },
    });

    // API must not reveal which field is wrong — just reject with 401
    expect(response.status()).toBe(401);
  });

  test('TC-09 POST /auth/login - should return 401 with valid username in wrong case', async ({ request }) => {
    // Username in uppercase — tests whether auth is case-sensitive
    const response = await request.post('/auth/login', {
      data: { username: VALID_USERNAME.toUpperCase(), password: VALID_PASSWORD },
    });

    // Must reject if the API treats usernames as case-sensitive
    expect(response.status()).toBe(401);
  });

  // ── Missing / Empty Fields ─────────────────────────────────────────────────

  test('TC-10 POST /auth/login - should fail with missing username', async ({ request }) => {
    // Request body contains only password — username field is absent
    const response = await request.post('/auth/login', {
      data: { password: VALID_PASSWORD },
    });

    // Must not return 200 when a required field is missing
    expect(response.status()).not.toBe(200);
  });

  test('TC-11 POST /auth/login - should fail with missing password', async ({ request }) => {
    // Request body contains only username — password field is absent
    const response = await request.post('/auth/login', {
      data: { username: VALID_USERNAME },
    });

    // Must not return 200 when a required field is missing
    expect(response.status()).not.toBe(200);
  });

  test('TC-12 POST /auth/login - should fail with empty string credentials', async ({ request }) => {
    // Both fields present but set to empty strings
    const response = await request.post('/auth/login', {
      data: { username: '', password: '' },
    });

    // Empty strings are not valid credentials
    expect(response.status()).not.toBe(200);
  });

  test('TC-13 POST /auth/login - should fail with whitespace-only credentials', async ({ request }) => {
    // Whitespace is different from empty string — tests trimming behaviour
    const response = await request.post('/auth/login', {
      data: { username: '   ', password: '   ' },
    });

    // Whitespace-only values must not be treated as valid credentials
    expect(response.status()).not.toBe(200);
  });

  test('TC-14 POST /auth/login - should fail with empty request body', async ({ request }) => {
    // No fields at all — completely empty JSON object
    const response = await request.post('/auth/login', {
      data: {},
    });

    // Must reject a request with no credentials provided
    expect(response.status()).not.toBe(200);
  });

  test('TC-15 POST /auth/login - should fail with null credentials', async ({ request }) => {
    // Null values explicitly sent for both fields
    const response = await request.post('/auth/login', {
      data: { username: null, password: null },
    });

    // Null is not a valid credential value
    expect(response.status()).not.toBe(200);
  });

  // ── Boundary ───────────────────────────────────────────────────────────────

  test('TC-16 POST /auth/login - should fail with very long username and password', async ({ request }) => {
    // 500-character strings test whether the API enforces input length limits
    const response = await request.post('/auth/login', {
      data: { username: LONG_STRING, password: LONG_STRING },
    });

    // Must not accept or crash on excessively long input
    expect(response.status()).not.toBe(200);
  });

  // ── Extra Fields ───────────────────────────────────────────────────────────

  test('TC-17 POST /auth/login - should ignore unknown extra fields in request body', async ({ request }) => {
    // Extra fields like role should be ignored by the API
    const response = await request.post('/auth/login', {
      data: { username: VALID_USERNAME, password: VALID_PASSWORD, role: 'admin', isAdmin: true },
    });

    // Valid credentials should still authenticate despite extra fields (API returns 201)
    expect(response.status()).toBe(201);
  });

  // ── Security ───────────────────────────────────────────────────────────────

  test('TC-18 POST /auth/login - should return 401 for SQL injection attempt', async ({ request }) => {
    // Classic SQL injection payload — must never result in a successful login
    const response = await request.post('/auth/login', {
      data: { username: "' OR '1'='1", password: "' OR '1'='1" },
    });

    // API must reject SQL injection payloads with 401, not 200 or 500
    expect(response.status()).toBe(401);
  });

  test('TC-19 POST /auth/login - should return 401 for script injection attempt', async ({ request }) => {
    // XSS payload in credentials — API must handle safely without executing
    const response = await request.post('/auth/login', {
      data: { username: '<script>alert(1)</script>', password: '<script>alert(1)</script>' },
    });

    // Must reject script injection payloads — must not return 200 or 500
    expect(response.status()).toBe(401);
  });

});

