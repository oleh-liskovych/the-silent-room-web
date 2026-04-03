const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiService {
  private getHeaders(auth = true): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, options);
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || error.error || res.statusText);
    }
    return res.json();
  }

  // Auth
  async signUp(username: string, displayName: string, email: string, password: string) {
    return this.request('/api/users', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ username, displayName, email, password }),
    });
  }

  async signIn(email: string, password: string) {
    return this.request<{ accessToken: string; expiresIn: number }>('/api/token', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
  }

  async signOut() {
    return this.request('/api/token', {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // Users
  async getMe() {
    return this.request<import('../types').User>('/api/users/me', { headers: this.getHeaders() });
  }

  async getUserByUsername(username: string) {
    return this.request<import('../types').User>(`/api/users/username/${username}`, { headers: this.getHeaders() });
  }

  async updateMe(data: { displayName?: string; email?: string; password?: string }) {
    return this.request<import('../types').User>('/api/users/me', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
  }

  async deleteProfilePicture() {
    return this.request<import('../types').User>('/api/users/me/profile-picture', {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // Contacts
  async getContacts() {
    return this.request<import('../types').Contact[]>('/api/contacts', { headers: this.getHeaders() });
  }

  async getIncomingInvitations() {
    return this.request<import('../types').Contact[]>('/api/contacts/invitations/incoming', { headers: this.getHeaders() });
  }

  async getOutgoingInvitations() {
    return this.request<import('../types').Contact[]>('/api/contacts/invitations/outgoing', { headers: this.getHeaders() });
  }

  async sendInvitation(username: string) {
    return this.request<import('../types').Contact>('/api/contacts/invite', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username }),
    });
  }

  async respondToInvitation(id: string, accept: boolean) {
    return this.request<import('../types').Contact>(`/api/contacts/invitations/${id}/respond`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ accept }),
    });
  }

  async removeContact(id: string) {
    return this.request(`/api/contacts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // Rooms
  async getRooms() {
    return this.request<import('../types').Room[]>('/api/rooms', { headers: this.getHeaders() });
  }

  async getRoom(id: string) {
    return this.request<import('../types').Room>(`/api/rooms/${id}`, { headers: this.getHeaders() });
  }

  async getDirectRoom(userId: string) {
    return this.request<import('../types').Room>(`/api/rooms/direct/${userId}`, { headers: this.getHeaders() });
  }

  async getMessages(roomId: string, page = 1, pageSize = 50) {
    return this.request<import('../types').MessagePage>(
      `/api/rooms/${roomId}/messages?page=${page}&pageSize=${pageSize}`,
      { headers: this.getHeaders() }
    );
  }

  // WebSocket
  getWsUrl() {
    const wsBase = API_URL.replace(/^http/, 'ws');
    const token = localStorage.getItem('token');
    return `${wsBase}/ws/${token}`;
  }
}

export const api = new ApiService();
