const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    // In a real integrated app, we might want to include credentials (cookies)
    // for cross-port requests if the backend is on a different port.
    if (API_URL && !options.credentials) {
        options.credentials = 'include';
    }

    const res = await fetch(url, options);
    return res;
}
