import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGet } from './client.js';

// Verifies the shared fetch wrapper handles the API contract:
// request failures, empty query values, and successful JSON responses.
describe('apiGet', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Ensures failed backend responses throw the expected client-side error.
  it('throws when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(apiGet('/properties')).rejects.toThrow('API request failed');
  });

  // Confirms null/undefined values are stripped before the fetch URL is built.
  it('ignores undefined and null params', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await apiGet('/properties', { city: undefined, zipcode: null, bedrooms: 2 });

    expect(fetchMock).toHaveBeenCalledWith('/api/properties?bedrooms=2');
  });

  // Validates the success path by returning JSON payloads from fetch().
  it('returns parsed JSON on a happy path', async () => {
    const payload = { properties: [{ bedrooms: 2 }] };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    }));

    await expect(apiGet('/properties', { bedrooms: 2 })).resolves.toEqual(payload);
  });
});
