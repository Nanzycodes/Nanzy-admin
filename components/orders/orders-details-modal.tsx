"use client";

// components/orders/order-details-modal.tsx

import { X } from "lucide-react";
import { OrderDetail, OrderStatus, STATUS_LABELS } from "@/types/order";

interface OrderDetailsModalProps {
  order: OrderDetail;
  isOpen: boolean;
  onClose: () => void;
}

// ── The 5 tracking steps ──
const TRACKING_STEPS = [
  "Your order has been received",
  "Order accepted by vendor",
  "Rider is on his way",
  "Order in transit",
  "Order delivered successfully",
];

// ── Which step index is "done" based on status ──
function getCompletedStep(status: OrderStatus): number {
  switch (status) {
    case "PENDING": return 0;
    case "IN_TRANSIT": return 2;
    case "DELIVERED": return 4;
    case "REJECTED": return 0;
    case "CANCELLED": return 0;
    default: return 0;
  }
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen) return null;

  const completedStep = getCompletedStep(order.status);

  return (
    // ── Dark overlay ──
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      {/* ── Modal box ── */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Order details</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Order ID: {order.id}</span>
              <StatusPill status={order.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={13} className="text-white" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-5">

          {/* ── Customer + Creator ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Customer</p>
              <p className="text-sm font-medium text-foreground">{order.customer}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Created by</p>
              <p className="text-sm font-medium text-foreground">{order.creator}</p>
            </div>
          </div>

          {/* ── Shipping Address ── */}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Shipping Address</p>
            <p className="text-sm font-medium text-foreground">{order.shipping_address}</p>
          </div>

          {/* ── Amount info ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
              <p className="text-sm font-medium text-foreground">
                ₦{Number(order.total_amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">VAT</p>
              <p className="text-sm font-medium text-foreground">
                ₦{Number(order.vat_amount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* ── Tracking info ── */}
          {order.tracking_number && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Tracking Number</p>
                <p className="text-sm font-medium text-foreground">{order.tracking_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Carrier</p>
                <p className="text-sm font-medium text-foreground">{order.carrier_name || "—"}</p>
              </div>
            </div>
          )}

          {/* ── Payment reference ── */}
          {order.payment_reference && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Payment Reference</p>
              <p className="text-sm font-medium text-foreground">{order.payment_reference}</p>
            </div>
          )}

          {/* ── Divider ── */}
          <div className="border-t border-border" />

          {/* ── Items ── */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              {Array.isArray(order.items) ? order.items.length : order.items_count} item(s)
            </p>
            <div className="flex flex-col gap-3">
              {Array.isArray(order.items) && order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {/* Product image */}
                  <div className="w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden flex items-center justify-center text-xs text-muted-foreground">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      "img"
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.variant}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-border" />

          {/* ── Order Tracking ── */}
          <div>
            <p className="text-sm font-medium text-foreground mb-4">Order Tracking</p>
            <div className="flex flex-col gap-0">
              {TRACKING_STEPS.map((step, index) => {
                const isDone = index <= completedStep;
                return (
                  <div key={index} className="flex gap-3">
                    {/* Circle + vertical line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${isDone ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                      {index < TRACKING_STEPS.length - 1 && (
                        <div className={`w-px flex-1 my-1 ${isDone ? "bg-green-300" : "bg-muted-foreground/20"}`} style={{ minHeight: "20px" }} />
                      )}
                    </div>
                    {/* Step text */}
                    <div className="pb-4">
                      <p className={`text-sm ${isDone ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {step}
                      </p>
                      {!isDone && (
                        <p className="text-xs text-muted-foreground">From ------</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small status pill ──
function StatusPill({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    PENDING: "bg-orange-100 text-orange-700",
    IN_TRANSIT: "bg-green-100 text-green-700",
    DELIVERED: "bg-purple-100 text-purple-700",
    REJECTED: "bg-red-100 text-red-600",
    CANCELLED: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}