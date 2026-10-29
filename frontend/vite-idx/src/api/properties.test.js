import { describe, expect, it, vi } from 'vitest';
import { buildPropertiesQuery, getProperties, getPropertyById, getPropertyOpenHouses } from './properties.js';

// Confirms filter serialization rules for listings queries and verifies the
// property helper functions hit the expected backend endpoints.
describe('buildPropertiesQuery', () => {
  // Verifies supported filters are converted into query-string key/value pairs.
  it('serializes supported filter params', () => {
    const query = buildPropertiesQuery({
      city: 'Austin',
      zipcode: '78701',
      minPrice: 800,
      maxPrice: 4500,
      beds: 2,
      baths: 2,
    });

    expect(query.get('city')).toBe('Austin');
    expect(query.get('zipcode')).toBe('78701');
    expect(query.get('minPrice')).toBe('800');
    expect(query.get('maxPrice')).toBe('4500');
    expect(query.get('beds')).toBe('2');
    expect(query.get('baths')).toBe('2');
  });

  // Ensures blank values and the default max/min values do not produce noisy filters.
  it('skips empty values and default price ranges', () => {
    const query = buildPropertiesQuery({
      city: '',
      zipcode: ' ',
      minPrice: 0,
      maxPrice: 10000,
      beds: '',
      baths: undefined,
    });

    expect(query.has('city')).toBe(false);
    expect(query.has('zipcode')).toBe(false);
    expect(query.has('minPrice')).toBe(false);
    expect(query.has('maxPrice')).toBe(false);
    expect(query.has('beds')).toBe(false);
    expect(query.has('baths')).toBe(false);
  });

  // Confirms user-supplied values are preserved when they differ from defaults.
  it('preserves non-default filter values', () => {
    const query = buildPropertiesQuery({
      city: 'Austin',
      zipcode: '78701',
      minPrice: 750,
      maxPrice: 3200,
      beds: 2,
      baths: '1.5',
    });

    expect(query.get('city')).toBe('Austin');
    expect(query.get('zipcode')).toBe('78701');
    expect(query.get('minPrice')).toBe('750');
    expect(query.get('maxPrice')).toBe('3200');
    expect(query.get('beds')).toBe('2');
    expect(query.get('baths')).toBe('1.5');
  });

  // Verifies the default listing query stays empty when all filters are effectively unset.
  it('omits empty default values so the default listings query stays unfiltered', () => {
    const query = buildPropertiesQuery({
      city: '',
      zipcode: '',
      minPrice: 0,
      maxPrice: 0,
      beds: 0,
      baths: 0,
    });

    expect(query.toString()).toBe('');
  });
});

describe('property API helpers', () => {
  // Ensures list queries include the serialized property filter string.
  it('calls getProperties with a serialized query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await getProperties({ city: 'Austin', bedrooms: 2 });

    expect(fetchMock).toHaveBeenCalledWith('/api/properties?city=Austin&bedrooms=2');
  });

  // Checks the detail route uses the property ID in the URL path.
  it('calls getPropertyById with the property id route', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 42 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await getPropertyById(42);

    expect(fetchMock).toHaveBeenCalledWith('/api/properties/42');
  });

  // Validates the open-house endpoint is called for a specific listing ID.
  it('calls getPropertyOpenHouses with the open homes route', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ date: '2026-01-01' }]),
    });
    vi.stubGlobal('fetch', fetchMock);

    await getPropertyOpenHouses(42);

    expect(fetchMock).toHaveBeenCalledWith('/api/properties/42/openhouses');
  });
});
