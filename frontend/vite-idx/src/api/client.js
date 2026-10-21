const API_BASE = '/api';

// Handles HTTP requests and sends to backend
export async function apiGet(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
        throw new Error('API request failed');
    }
    return response.json();
}