import {
  ServiceRequest,
  CreateRequestPayload,
  UpdateRequestPayload,
  PaginationMeta,
  RequestStats,
  Status,
} from '../types/request';

const API_BASE = '/api';

export interface GetRequestsParams {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface GetRequestsResponse {
  success: boolean;
  data: ServiceRequest[];
  pagination: PaginationMeta;
}

export const api = {
  async getRequests(params: GetRequestsParams = {}): Promise<GetRequestsResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.priority && params.priority !== 'All') query.set('priority', params.priority);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/requests?${query.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch requests' }));
      throw new Error(err.error || 'Failed to fetch requests');
    }
    return res.json();
  },

  async getRequestById(id: string): Promise<ServiceRequest> {
    const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(id)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request not found' }));
      throw new Error(err.error || 'Request not found');
    }
    const json = await res.json();
    return json.data;
  },

  async createRequest(
    payload: CreateRequestPayload,
    idempotencyKey?: string
  ): Promise<{ data: ServiceRequest; idempotentReplay?: boolean }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      const msg = json.error || (json.validationErrors ? Object.values(json.validationErrors).join(', ') : 'Failed to create request');
      const error: any = new Error(msg);
      error.validationErrors = json.validationErrors;
      throw error;
    }
    return json;
  },

  async updateRequest(id: string, payload: UpdateRequestPayload): Promise<ServiceRequest> {
    const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      const msg = json.error || (json.validationErrors ? Object.values(json.validationErrors).join(', ') : 'Failed to update request');
      const error: any = new Error(msg);
      error.validationErrors = json.validationErrors;
      throw error;
    }
    return json.data;
  },

  async updateRequestStatus(id: string, status: Status): Promise<ServiceRequest> {
    const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update status');
    }
    return json.data;
  },

  async deleteRequest(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({ error: 'Failed to delete request' }));
      throw new Error(json.error || 'Failed to delete request');
    }
  },

  async getStats(): Promise<RequestStats> {
    const res = await fetch(`${API_BASE}/requests/stats`);
    if (!res.ok) {
      throw new Error('Failed to fetch statistics');
    }
    const json = await res.json();
    return json.data;
  },

  async resetDatabase(): Promise<void> {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error('Failed to reset database');
    }
  },

  async getLatestReport(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/latest`);
    if (!res.ok) {
      throw new Error('Failed to fetch latest report');
    }
    const json = await res.json();
    return json.data;
  },

  async getReportsList(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) {
      throw new Error('Failed to fetch reports list');
    }
    const json = await res.json();
    return json.data;
  },

  getArtifactUrl(filename: string): string {
    return `${API_BASE}/reports/artifact/${encodeURIComponent(filename)}`;
  },
};

