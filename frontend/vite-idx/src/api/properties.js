import { apiGet } from './client.js';

export function buildPropertiesQuery(filters = {}) {
    const params = new URLSearchParams();

    const normalizedFilters = {
        ...filters,
        ...(filters.zip && !filters.zipcode ? { zipcode: filters.zip } : {}),
    };

    const entries = Object.entries(normalizedFilters);

    for (const [key, value] of entries) {
        if (value === undefined || value === null) {
            continue;
        }

        const stringValue = String(value).trim();
        if (stringValue === '') {
            continue;
        }

        const normalizedKey = key === 'zip' ? 'zipcode' : key;

        if (normalizedKey === 'minPrice' && Number(value) === 0) {
            continue;
        }

        if (normalizedKey === 'maxPrice' && Number(value) === 10000) {
            continue;
        }

        if (normalizedKey === 'beds' && Number(value) === 0) {
            continue;
        }

        if (normalizedKey === 'baths' && Number(value) === 0) {
            continue;
        }

        params.set(normalizedKey, stringValue);
    }

    return params;
}

export async function getProperties(filters = {}) {
    return apiGet('/properties', buildPropertiesQuery(filters));
}

export async function getPropertyById(id) {
    return apiGet('/properties/' + id);
}

export async function getPropertyOpenHouses(id) {
    return apiGet('/properties/' + id + '/openhouses');
}