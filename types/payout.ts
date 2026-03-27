export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

// Admin - Sellers
export interface AdminSeller {
  id: number;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  is_active: boolean;
  date_joined: string;
  phone_number: string;
  address: string;
  product_count: string;
  business_name: string;
}

export interface PaginatedAdminSellerList {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminSeller[];
}

// Admin - Influencers
export interface AdminInfluencer {
  id: number;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  is_active: boolean;
  date_joined: string;
  phone_number: string;
  address: string;
  instagram_username: string;
  x_username: string;
  facebook_username: string;
  tiktok_username: string;
}

export interface PaginatedAdminInfluencerList {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminInfluencer[];
}

export interface TransactionOverview {
  timeframe: string;
  period: {
    current_start: string;
    current_end: string;
    previous_start: string;
    previous_end: string;
  };
  total_revenue: {
    amount: string;
    growth_percentage: number;
  };
  processed_payout: {
    amount: string;
    growth_percentage: number;
  };
  failed_transactions: number;
}

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER"
  | "PAYMENT"
  | "ESCROW_HOLD"
  | "ESCROW_RELEASE"
  | "ESCROW_REFUND";

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: string; // decimal string from API
  transaction_type: TransactionType;
  status: TransactionStatus;
  reference: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Maps API status → display label */
export const TRANSACTION_STATUS_LABEL: Record<TransactionStatus, string> = {
  COMPLETED: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
  CANCELLED: "Failed",
};

/** Maps transaction_type → human-readable string */
export function formatTransactionType(type: TransactionType): string {
  return type
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}
