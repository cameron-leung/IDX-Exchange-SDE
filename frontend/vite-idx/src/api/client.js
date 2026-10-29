const API_BASE = '/api';

// Handles HTTP requests and sends to backend
export async function apiGet(endpoint, params = {}) {
    const queryParams = params instanceof URLSearchParams ? params : new URLSearchParams();

    if (!(params instanceof URLSearchParams)) {
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || String(value).trim() === '') {
                return;
            }
            queryParams.append(key, String(value));
        });
    }

    const queryString = queryParams.toString();
    const response = await fetch(`${API_BASE}${endpoint}${queryString ? `?${queryString}` : ''}`);

    if (!response.ok) {
        throw new Error('API request failed');
    }
    return response.json();
}