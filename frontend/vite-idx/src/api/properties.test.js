import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPropertiesQuery } from './properties.js';

test('buildPropertiesQuery serializes supported filter params', () => {
  const query = buildPropertiesQuery({
    city: 'Austin',
    zipcode: '78701',
    minPrice: 800,
    maxPrice: 4500,
    beds: 2,
    baths: 2,
  });

  assert.equal(query.get('city'), 'Austin');
  assert.equal(query.get('zipcode'), '78701');
  assert.equal(query.get('minPrice'), '800');
  assert.equal(query.get('maxPrice'), '4500');
  assert.equal(query.get('beds'), '2');
  assert.equal(query.get('baths'), '2');
});

test('buildPropertiesQuery skips empty values and default price ranges', () => {
  const query = buildPropertiesQuery({
    city: '',
    zipcode: ' ',
    minPrice: 0,
    maxPrice: 10000,
    beds: '',
    baths: undefined,
  });

  assert.equal(query.has('city'), false);
  assert.equal(query.has('zipcode'), false);
  assert.equal(query.has('minPrice'), false);
  assert.equal(query.has('maxPrice'), false);
  assert.equal(query.has('beds'), false);
  assert.equal(query.has('baths'), false);
});

test('buildPropertiesQuery preserves non-default filter values', () => {
  const query = buildPropertiesQuery({
    city: 'Austin',
    zipcode: '78701',
    minPrice: 750,
    maxPrice: 3200,
    beds: 2,
    baths: '1.5',
  });

  assert.equal(query.get('city'), 'Austin');
  assert.equal(query.get('zipcode'), '78701');
  assert.equal(query.get('minPrice'), '750');
  assert.equal(query.get('maxPrice'), '3200');
  assert.equal(query.get('beds'), '2');
  assert.equal(query.get('baths'), '1.5');
});
