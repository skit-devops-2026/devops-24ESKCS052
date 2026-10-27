const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'medcare_access_token';

export const authToken = {
  // Read the access token from this browser session.
  get: () => sessionStorage.getItem(TOKEN_KEY),
  // Save the token returned by the backend after authentication.
  set: (value) => sessionStorage.setItem(TOKEN_KEY, value),
  // Remove the current session token when the user logs out.
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

// Send an authenticated JSON request and convert backend errors into useful messages.
export async function api(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken.get() ? { Authorization: `Bearer ${authToken.get()}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    if (response.status === 401) authToken.clear();
    const error = new Error(payload?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}
