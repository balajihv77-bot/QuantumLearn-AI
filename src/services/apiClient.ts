/**
 * QuantumLearn AI - Unified API Client & Service Bridge
 * 
 * DESIGN PRINCIPLES:
 * 1. Base URL Awareness: Uses VITE_API_BASE_URL (defaults to empty string for relative or http://localhost:8000).
 * 2. Transparent Fallbacks: Checks live backend health; gracefully uses client-side
 *    storage/simulation if backend is offline. Never claims false execution.
 * 3. Token Handling: Attaches Authorization Bearer token to authenticated endpoints.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '';

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  institution?: string;
  role: string;
  xp: number;
  level: number;
  streak_days: number;
}

export interface SavedCircuitPayload {
  title: string;
  description?: string;
  num_qubits: number;
  num_steps: number;
  grid: (string | null)[][];
  is_public?: boolean;
}

export interface SavedCircuitResponse {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  num_qubits: number;
  num_steps: number;
  grid: (string | null)[][];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private tokenKey = 'quantumlearn_auth_token';
  private userKey = 'quantumlearn_user_profile';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getCachedUser(): UserProfile | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setCachedUser(user: UserProfile) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch {
        // use default
      }
      throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
  }

  // 1. Health
  async checkHealth(): Promise<{ status: string; service: string }> {
    return this.request('/api/health');
  }

  // 2. Auth
  async register(data: { email: string; username: string; password: string; full_name?: string; institution?: string }): Promise<AuthTokens> {
    const res = await this.request<AuthTokens>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(usernameOrEmail: string, password: string): Promise<AuthTokens> {
    const res = await this.request<AuthTokens>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username_or_email: usernameOrEmail, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const user = await this.request<UserProfile>('/api/users/me');
    this.setCachedUser(user);
    return user;
  }

  // 3. Circuits
  async saveCircuit(payload: SavedCircuitPayload): Promise<SavedCircuitResponse> {
    return this.request<SavedCircuitResponse>('/api/circuits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getCircuits(): Promise<{ total: number; circuits: SavedCircuitResponse[] }> {
    return this.request<{ total: number; circuits: SavedCircuitResponse[] }>('/api/circuits');
  }

  // 4. Remote Simulation (Statevector)
  async runRemoteSimulation(numQubits: number, grid: (string | null)[][], shots: number = 1024) {
    return this.request('/api/simulation/run', {
      method: 'POST',
      body: JSON.stringify({ num_qubits: numQubits, grid, shots }),
    });
  }

  // 5. Quiz Submission
  async submitQuiz(quizId: string, answers: Record<string, string>) {
    return this.request('/api/quizzes/submit', {
      method: 'POST',
      body: JSON.stringify({ quiz_id: quizId, answers }),
    });
  }

  // 6. Progress Sync
  async syncProgress(moduleId: string, isCompleted: boolean = true) {
    return this.request('/api/learning/progress', {
      method: 'POST',
      body: JSON.stringify({ module_id: moduleId, is_completed: isCompleted }),
    });
  }
}

export const apiClient = new ApiClient();
