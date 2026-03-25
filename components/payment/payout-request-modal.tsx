"use client";

import { X } from "lucide-react";
import { Payout } from "@/types/payout";
import apiClient from "@/lib/apiclient";
import { useState } from "react";
import { format } from "date-fns";

interface PayoutRequestModalProps {
  payout: Payout;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: Payout["status"]) => void;
}

const STATUS_STYLES: Record<Payout["status"], string> = {
  PAID: "bg-green-50 text-green-700 border border-green-200",
  FAILED: "bg-red-50 text-red-600 border border-red-200",
  PENDING: "bg-orange-50 text-orange-600 border border-orange-200",
};

const STATUS_LABELS: Record<Payout["status"], string> = {
  PAID: "Paid",
  FAILED: "Failed",
  PENDING: "Pending",
};

export default function PayoutRequestModal({
  payout,
  isOpen,
  onClose,
  onStatusChange,
}: PayoutRequestModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleAction(newStatus: "APPROVED" | "CANCELLED") {
    setLoading(true);
    try {
      await apiClient.patch(`/admin/payouts/${payout.id}/`, { status: newStatus });
      onStatusChange(payout.id, newStatus === "APPROVED" ? "PAID" : "FAILED");
      onClose();
    } catch {
      alert("Could not update payout status. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const formattedDate = (() => {
    try {
      return format(new Date(payout.requested_on), "dd-MM-yyyy");
    } catch {
      return payout.requested_on;
    }
  })();

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
            <h2 className="text-base font-semibold text-foreground">Payout request</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Approve payout request</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[payout.status]}`}
              >
                {STATUS_LABELS[payout.status]}
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
            <p className="text-xs text-muted-foreground mb-0.5">Sellers</p>
            <p className="text-sm font-medium text-foreground">{payout.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Request date</p>
            <p className="text-sm font-medium text-foreground">{formattedDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Account number</p>
            <p className="text-sm font-medium text-foreground">{payout.account_number}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Account name</p>
            <p className="text-sm font-medium text-foreground">{payout.account_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Bank name</p>
            <p className="text-sm font-medium text-foreground">{payout.bank_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Payment method</p>
            <p className="text-sm font-medium text-foreground">{payout.payment_method}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground mb-0.5">Payout request</p>
            <p className="text-lg font-bold text-foreground">
              ₦{payout.amount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
          <button
            onClick={() => handleAction("APPROVED")}
            disabled={loading || payout.status !== "PENDING"}
            className="h-11 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Approve payout
          </button>
          <button
            onClick={() => handleAction("CANCELLED")}
            disabled={loading || payout.status !== "PENDING"}
            className="h-11 rounded-lg border border-border bg-white text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel payout
          </button>
        </div>
      </div>
    </div>
  );
}
