export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type Status = 'Open' | 'In Progress' | 'Completed' | 'Closed';
export type Category =
  | 'Maintenance & Repairs'
  | 'Plumbing'
  | 'Electrical'
  | 'HVAC & Air Conditioning'
  | 'Cleaning & Housekeeping'
  | 'Security & Access'
  | 'Pest Control'
  | 'Landscaping & Grounds'
  | 'Parking & Vehicles'
  | 'Lease & Tenancy'
  | 'Move In / Move Out'
  | 'Common Areas & Amenities';

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: Category | string;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status?: Status;
  idempotencyKey?: string;
}

export interface UpdateRequestPayload {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestStats {
  total: number;
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
  byCategory: Record<string, number>;
  recent: ServiceRequest[];
}
