"use client";

import React, { useState } from "react";
import InnerLayout from "@/components/inner-layout";
import PaymentTable from "@/components/payment/payment-table";
import PayoutRequestModal from "@/components/payment/payout-request-modal";
import { Transaction } from "@/types/payout";
import { TrendingUp, ChevronDown } from "lucide-react";

type PayoutRole = "seller" | "influencer" | "delivery_partner";

const TABS: { label: string; role: PayoutRole }[] = [
  { label: "Sellers", role: "seller" },
  { label: "Influencers", role: "influencer" },
  { label: "Delivery partner", role: "delivery_partner" },
];

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState<PayoutRole>("seller");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleViewDetails(transaction: Transaction) {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  }

  return (
    <InnerLayout sectionHeader="Payment" sectionSubheader="Manage and process payouts">
      <div>
        {/* Stat cards — static until backend adds stats endpoints */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="#22C55E" strokeWidth="1.5" />
                  <path d="M2 10h20" stroke="#22C55E" strokeWidth="1.5" />
                  <path d="M6 15h4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            }
            label="Total revenue"
            value="—"
            trend="9%"
          />
          <StatCard
            icon={
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#635bff" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M2 17l10 5 10-5" stroke="#635bff" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M2 12l10 5 10-5" stroke="#635bff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            }
            label="Processed payouts"
            value="—"
            trend="9%"
          />
          <StatCard
            icon={
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="1.5" />
                  <path d="M12 8v4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="0.75" fill="#EF4444" />
                </svg>
              </div>
            }
            label="Failed transactions"
            value="—"
            trend="9%"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.role}
              onClick={() => setActiveTab(tab.role)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                ${
                  activeTab === tab.role
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table — tabs share same endpoint (no role filter in API yet) */}
        <PaymentTable onViewDetails={handleViewDetails} />

        {/* Modal */}
        {selectedTransaction && (
          <PayoutRequestModal
            transaction={selectedTransaction}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTransaction(null);
            }}
          />
        )}
      </div>
    </InnerLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>{icon}</div>
        <button className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1">
          This Week <ChevronDown size={11} />
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <span className="text-xs text-green-700 font-medium flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
          <TrendingUp size={11} className="text-green-700" />
          {trend}
        </span>
      </div>
    </div>
  );
}
