export type OrderStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "REJECTED" | "CANCELLED" | "PAID" | "SHIPPED";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  IN_TRANSIT: "In-transit",
  DELIVERED: "Delivered",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  PAID: "Paid",
  SHIPPED: "Shipped",
};

export interface OrderItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  customer: string;
  customer_email: string;
  total_amount: string;
  items_count: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

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
  items_count: string;
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

export interface PaginatedOrders {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}