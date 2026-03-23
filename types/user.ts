export type UserRole = "user" | "seller" | "delivery_partner";
export type UserStatus = "active" | "suspended" | "pending";

export interface User {
  id: string;
  name: string;
  email: string;
  date_joined: string;
  status: UserStatus;
  role: UserRole;
}