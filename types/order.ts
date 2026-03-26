// types/order.ts

// ── API status values (from backend) ──
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "REJECTED" | "CANCELLED";

// ── Used for display labels and badge colors ──
export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In-transit",
  DELIVERED: "Delivered",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

// ── Single item inside an order (from detail endpoint) ──
export interface OrderItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  image?: string;
}

// ── Order as returned by GET /api/v1/admin/orders/ (list) ──
export interface Order {
  id: string;
  customer: string;
  customer_email: string;
  total_amount: string;
  items_count: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

// ── Order as returned by GET /api/v1/admin/orders/{id}/ (detail) ──
export interface OrderDetail {
  id: string;
  customer: string;
  creator: string;
  items: OrderItem[];
  total_amount: string;
  items_total: string;
  vat_amount: string;
  status: OrderStatus;
  shipping_address: string;
  payment_reference: string;
  escrow_reference: string;
  delivery_confirmed_at: string;
  delivery_confirmed_by: string;
  items_count: number;
  is_escrow_active: boolean;
  tracking_number: string;
  carrier_name: string;
  carrier_slug: string;
  carrier_logo: string;
  tracking_url: string;
  shipped_at: string;
  shipping_cost: string;
  shipping_currency: string;
  created_at: string;
  updated_at: string;
}

// ── Paginated API response wrapper ──
export interface PaginatedOrders {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}