export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

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
