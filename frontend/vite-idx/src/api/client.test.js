import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGet } from './client.js';

describe('apiGet', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds a query string from object params while omitting empty values', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await apiGet('/users', {
      page: 1,
      search: '  ',
      active: true,
      filter: null,
      type: undefined,
      id: 42,
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/users?page=1&active=true&id=42');
  });

  it('uses the provided URLSearchParams as-is', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const params = new URLSearchParams({
      foo: 'bar',
      baz: 'two words',
    });

    await apiGet('/search', params);

    expect(fetchMock).toHaveBeenCalledWith('/api/search?foo=bar&baz=two+words');
  });

  it('returns parsed JSON data when response is ok and throws when the backend is unsuccessful', async () => {
    const payload = { users: [{ id: 1, name: 'Ada' }] };
    const successFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    vi.stubGlobal('fetch', successFetch);

    const result = await apiGet('/users', { limit: 1 });

    expect(result).toEqual(payload);
    expect(successFetch).toHaveBeenCalledWith('/api/users?limit=1');

    const failureFetch = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal('fetch', failureFetch);

    await expect(apiGet('/users')).rejects.toThrow('API request failed');
  });
});
