"use client";

import { X } from "lucide-react";
import {
  Transaction,
  TRANSACTION_STATUS_LABEL,
  formatTransactionType,
} from "@/types/payout";
import { format } from "date-fns";

interface PayoutRequestModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-50 text-green-700 border border-green-200",
  PENDING: "bg-orange-50 text-orange-600 border border-orange-200",
  FAILED: "bg-red-50 text-red-600 border border-red-200",
  CANCELLED: "bg-red-50 text-red-600 border border-red-200",
};

export default function PayoutRequestModal({
  transaction,
  isOpen,
  onClose,
}: PayoutRequestModalProps) {
  if (!isOpen) return null;

  const formattedDate = (() => {
    try {
      return format(new Date(transaction.created_at), "dd-MM-yyyy");
    } catch {
      return transaction.created_at;
    }
  })();

  const amount = parseFloat(transaction.amount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Transaction details
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground font-mono">
                {transaction.id.slice(0, 16)}…
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                  STATUS_STYLES[transaction.status]
                }`}
              >
                {TRANSACTION_STATUS_LABEL[transaction.status]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Wallet ID</p>
            <p className="text-sm font-medium text-foreground font-mono break-all">
              {transaction.wallet_id}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Request date</p>
            <p className="text-sm font-medium text-foreground">{formattedDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Transaction type</p>
            <p className="text-sm font-medium text-foreground">
              {formatTransactionType(transaction.transaction_type)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Reference</p>
            <p className="text-sm font-medium text-foreground">
              {transaction.reference ?? "—"}
            </p>
          </div>
          {transaction.description && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-0.5">Description</p>
              <p className="text-sm font-medium text-foreground">
                {transaction.description}
              </p>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
            <p className="text-lg font-bold text-foreground">
              ₦{isNaN(amount) ? transaction.amount : amount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer — actions disabled (no API endpoint) */}
        <div className="px-6 pb-6">
          <p className="text-xs text-muted-foreground text-center">
            Approve / cancel actions require a payout management endpoint from the backend.
          </p>
        </div>
      </div>
    </div>
  );
}
