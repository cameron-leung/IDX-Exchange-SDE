import { apiGet } from './client.js';

export const INVALID_PROPERTY_ID_MESSAGE = 'Invalid Property ID';

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

        if (['minPrice', 'maxPrice', 'beds', 'baths'].includes(normalizedKey)) {
            const numericValue = Number(value);
            if (numericValue === 0) {
                continue;
            }
            if (normalizedKey === 'maxPrice' && numericValue === 10000) {
                continue;
            }
        }

        params.set(normalizedKey, stringValue);
    }

    return params;
}

export async function getProperties(filters = {}, pagination = {}) {
    const query = buildPropertiesQuery({
        ...filters,
        ...(pagination.limit !== undefined ? { limit: pagination.limit } : {}),
        ...(pagination.offset !== undefined ? { offset: pagination.offset } : {}),
    });

    return apiGet('/properties', query);
}

const isValidPropertyId = (id) => {
    const normalizedId = String(id ?? '').trim();
    return /^\d+$/.test(normalizedId) && normalizedId.length >= 8 && normalizedId.length <= 10;
};

export async function getPropertyById(id) {
    if (!isValidPropertyId(id)) {
        throw new Error(INVALID_PROPERTY_ID_MESSAGE);
    }

    return apiGet('/properties/' + id);
}

export async function getPropertyOpenHouses(id) {
    if (!isValidPropertyId(id)) {
        throw new Error(INVALID_PROPERTY_ID_MESSAGE);
    }

    return apiGet('/properties/' + id + '/openhouses');
}