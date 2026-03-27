"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, Copy, Check } from "lucide-react";
import {
  Transaction,
  TransactionStatus,
  TRANSACTION_STATUS_LABEL,
  formatTransactionType,
} from "@/types/payout";
import { format } from "date-fns";
import apiClient from "@/lib/apiclient";

interface TransactionDetailModalProps {
  transactionId: string;
  onClose: () => void;
}

const STATUS_STYLES: Record<TransactionStatus, string> = {
  COMPLETED: "bg-green-50 text-green-700 border border-green-200",
  PENDING: "bg-orange-50 text-orange-600 border border-orange-200",
  FAILED: "bg-red-50 text-red-600 border border-red-200",
  CANCELLED: "bg-red-50 text-red-600 border border-red-200",
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
      title="Copy"
    >
      {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
    </button>
  );
}

export default function TransactionDetailModal({
  transactionId,
  onClose,
}: TransactionDetailModalProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/admin/transactions/${transactionId}/`);
        const payload = response.data?.data ?? response.data;
        setTransaction(payload);
      } catch {
        setError("Failed to load transaction details.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [transactionId]);

  const formattedDate = (() => {
    if (!transaction) return "—";
    try {
      return format(new Date(transaction.created_at), "dd MMM yyyy, HH:mm");
    } catch {
      return transaction.created_at;
    }
  })();

  const updatedDate = (() => {
    if (!transaction) return "—";
    try {
      return format(new Date(transaction.updated_at), "dd MMM yyyy, HH:mm");
    } catch {
      return transaction.updated_at;
    }
  })();

  const amount = transaction ? parseFloat(transaction.amount) : NaN;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Transaction Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={22} className="animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-500 text-center py-8">{error}</p>
          ) : transaction ? (
            <div className="space-y-5">
              {/* Amount + Status hero row */}
              <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₦{isNaN(amount) ? transaction.amount : amount.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                    STATUS_STYLES[transaction.status]
                  }`}
                >
                  {TRANSACTION_STATUS_LABEL[transaction.status]}
                </span>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-foreground font-mono truncate">
                      {transaction.id}
                    </p>
                    <CopyButton value={transaction.id} />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Wallet ID</p>
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-foreground font-mono truncate">
                      {transaction.wallet_id}
                    </p>
                    <CopyButton value={transaction.wallet_id} />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatTransactionType(transaction.transaction_type)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reference</p>
                  <p className="text-sm font-medium text-foreground">
                    {transaction.reference ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm font-medium text-foreground">{formattedDate}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last updated</p>
                  <p className="text-sm font-medium text-foreground">{updatedDate}</p>
                </div>

                {transaction.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                  </div>
                )}

                {transaction.metadata?.order_id && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-foreground font-mono">
                        {String(transaction.metadata.order_id)}
                      </p>
                      <CopyButton value={String(transaction.metadata.order_id)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
