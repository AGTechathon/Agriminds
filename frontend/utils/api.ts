const API_URL = 'http://localhost:5000/api';

export const api = {
  async get(endpoint: string) {
    const token = localStorage.getItem('token');
    console.log(`🚀 GET ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    console.log(`✅ GET response:`, data);
    return data;
  },

  async post(endpoint: string, data: any, headers: Record<string, string> = {}) {
    const token = localStorage.getItem('token');
    console.log(`🚀 POST ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      method: 'POST',
      headers: {
        ...(headers['Content-Type'] ? { 'Content-Type': headers['Content-Type'] } : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: headers['Content-Type'] === 'multipart/form-data' ? data : JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  },

  async put(endpoint: string, data: any) {
    const token = localStorage.getItem('token');
    console.log(`🚀 PUT ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  },

  async delete(endpoint: string) {
    const token = localStorage.getItem('token');
    console.log(`🚀 DELETE ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  }
};