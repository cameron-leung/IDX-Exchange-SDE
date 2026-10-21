import { apiGet } from './client.js';

export async function getProperties() {
        return apiGet('/properties');
}

export async function getPropertyById(id) {
    return apiGet('/properties/' + id);
}

export async function getPropertyOpenHouses(id) {
    return apiGet('/properties/' + id + '/openhouses');
}