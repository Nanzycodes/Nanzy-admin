export type UserRole = "user" | "seller" | "influencer";
export type UserStatus = "active" | "suspended" | "pending" | "inactive";

// Shape returned by GET /api/v1/admin/customers/
export interface User {
  id: number;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: UserStatus;
  is_active: boolean;
  date_joined: string;
  phone_number?: string;
  bio?: string;
  role: UserRole;

  // helper getter used in UI
  name: string;
}

export interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface AdminEntry {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string;
  status: "active" | "pending" | "suspended" | "inactive";
  is_active: boolean;
  date_joined: string; // ISO datetime from API
}
