import { describe, expect, it } from 'vitest';
import { buildPropertiesQuery } from './properties.js';

describe('buildPropertiesQuery', () => {
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
