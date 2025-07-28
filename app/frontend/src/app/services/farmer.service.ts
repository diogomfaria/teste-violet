const API_URL = 'http://localhost:3002';

export interface Farmer {
  _id?: string;
  fullName: string;
  cpf: string;
  birthDate?: string;
  phone?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  // Handle error responses
  if (!response.ok) {
    throw new Error(data.message || 'Ocorreu um erro inesperado');
  }
  
  // Handle success response with { success, data } format
  if (data && typeof data === 'object' && 'success' in data) {
    if (!data.success) {
      throw new Error(data.message || 'Ocorreu um erro inesperado');
    }
    return data.data;
  }
  
  // Handle raw data response (direct array or object)
  return data as T;
}

export async function createFarmer(farmer: Omit<Farmer, '_id' | 'active' | 'createdAt' | 'updatedAt'>): Promise<Farmer> {
  const response = await fetch(`${API_URL}/farmers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(farmer),
  });

  return handleResponse<Farmer>(response);
}

export interface SearchParams {
  query?: string;
  status?: 'active' | 'inactive' | 'all';
}

export async function searchFarmers(params: SearchParams = {}): Promise<Farmer[]> {
  const { query, status = 'active' } = params;
  const searchParams = new URLSearchParams();
  
  if (query) searchParams.append('q', query);
  if (status !== 'all') searchParams.append('status', status);
  
  const response = await fetch(`${API_URL}/farmers/search?${searchParams.toString()}`, {
    credentials: 'include',
  });
  
  return handleResponse<Farmer[]>(response);
}

export async function getFarmers(includeInactive = false): Promise<Farmer[]> {
  const response = await fetch(`${API_URL}/farmers?includeInactive=${includeInactive}`, {
    credentials: 'include',
  });
  return handleResponse<Farmer[]>(response);
}

export async function getFarmerById(id: string): Promise<Farmer> {
  const response = await fetch(`${API_URL}/farmers/${id}`, {
    credentials: 'include',
  });
  return handleResponse<Farmer>(response);
}

export async function updateFarmer(id: string, farmer: Partial<Omit<Farmer, 'cpf' | 'active'>>): Promise<Farmer> {
  const response = await fetch(`${API_URL}/farmers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(farmer),
  });

  return handleResponse<Farmer>(response);
}

export async function deleteFarmer(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/farmers/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  return handleResponse<{ message: string }>(response);
}

export async function deactivateFarmer(id: string): Promise<{ message: string; data: Farmer }> {
  const response = await fetch(`${API_URL}/farmers/${id}/deactivate`, {
    method: 'POST',
    credentials: 'include',
  });

  return handleResponse<{ message: string; data: Farmer }>(response);
}
