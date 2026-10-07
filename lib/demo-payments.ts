import { Transaction, TransactionType, TransactionStatus } from "@/types/payout";

const STORAGE_PREFIX = "pearly_demo_payments";
const TRANSACTION_TYPES: TransactionType[] = [
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER",
  "PAYMENT",
  "ESCROW_HOLD",
  "ESCROW_RELEASE",
  "ESCROW_REFUND",
];
const TRANSACTION_STATUSES: TransactionStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "demo-tx-501",
    wallet_id: "wallet-seller-201",
    amount: "245000.00",
    transaction_type: "WITHDRAWAL",
    status: "COMPLETED",
    reference: "DEMO-PAYOUT-501",
    description: "Weekly seller payout",
    metadata: { order_id: "demo-order-1047" },
    created_at: "2026-10-02T11:15:00.000Z",
    updated_at: "2026-10-02T11:20:00.000Z",
  },
  {
    id: "demo-tx-502",
    wallet_id: "wallet-seller-202",
    amount: "86200.00",
    transaction_type: "PAYMENT",
    status: "COMPLETED",
    reference: "DEMO-PAYMENT-502",
    description: "Marketplace order payment",
    metadata: { order_id: "demo-order-1048" },
    created_at: "2026-10-01T14:05:00.000Z",
    updated_at: "2026-10-01T14:05:00.000Z",
  },
  {
    id: "demo-tx-503",
    wallet_id: "wallet-seller-203",
    amount: "51800.00",
    transaction_type: "WITHDRAWAL",
    status: "PENDING",
    reference: "DEMO-PAYOUT-503",
    description: "Seller payout awaiting processing",
    metadata: null,
    created_at: "2026-09-30T09:40:00.000Z",
    updated_at: "2026-09-30T09:40:00.000Z",
  },
  {
    id: "demo-tx-504",
    wallet_id: "wallet-seller-204",
    amount: "12750.00",
    transaction_type: "WITHDRAWAL",
    status: "FAILED",
    reference: "DEMO-PAYOUT-504",
    description: "Payout could not be completed",
    metadata: null,
    created_at: "2026-09-28T16:30:00.000Z",
    updated_at: "2026-09-28T16:45:00.000Z",
  },
  {
    id: "demo-tx-505",
    wallet_id: "wallet-influencer-301",
    amount: "68400.00",
    transaction_type: "WITHDRAWAL",
    status: "COMPLETED",
    reference: "DEMO-PAYOUT-505",
    description: "Creator commission payout",
    metadata: null,
    created_at: "2026-10-03T12:10:00.000Z",
    updated_at: "2026-10-03T12:11:00.000Z",
  },
  {
    id: "demo-tx-506",
    wallet_id: "wallet-influencer-302",
    amount: "14900.00",
    transaction_type: "PAYMENT",
    status: "COMPLETED",
    reference: "DEMO-PAYMENT-506",
    description: "Referral commission",
    metadata: null,
    created_at: "2026-10-01T08:25:00.000Z",
    updated_at: "2026-10-01T08:25:00.000Z",
  },
  {
    id: "demo-tx-507",
    wallet_id: "wallet-influencer-303",
    amount: "9200.00",
    transaction_type: "WITHDRAWAL",
    status: "CANCELLED",
    reference: "DEMO-PAYOUT-507",
    description: "Creator payout request cancelled",
    metadata: null,
    created_at: "2026-09-29T10:00:00.000Z",
    updated_at: "2026-09-29T10:30:00.000Z",
  },
];

function storageKey(mode: "sample" | "empty") {
  return `${STORAGE_PREFIX}_${mode}`;
}

function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== "object" || value === null) return false;
  const transaction = value as Record<string, unknown>;
  return (
    typeof transaction.id === "string" &&
    typeof transaction.wallet_id === "string" &&
    typeof transaction.amount === "string" &&
    typeof transaction.transaction_type === "string" &&
    TRANSACTION_TYPES.includes(transaction.transaction_type as TransactionType) &&
    typeof transaction.status === "string" &&
    TRANSACTION_STATUSES.includes(transaction.status as TransactionStatus) &&
    typeof transaction.created_at === "string" &&
    typeof transaction.updated_at === "string"
  );
}

export function getDemoTransactions(mode: "sample" | "empty"): Transaction[] {
  const serialized = window.localStorage.getItem(storageKey(mode));
  if (serialized === null) return mode === "sample" ? SAMPLE_TRANSACTIONS : [];

  let saved: unknown;
  try {
    saved = JSON.parse(serialized);
  } catch {
    throw new Error("Saved demo transactions are invalid transaction.");
  }
  if (!Array.isArray(saved) || !saved.every(isTransaction)) {
    throw new Error("QUick reminder:This is a demo mode.");
  }
  return saved;
}
