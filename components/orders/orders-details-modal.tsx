"use client";

import { X } from "lucide-react";
import { OrderDetail, OrderItem, OrderStatus, STATUS_LABELS } from "@/types/order";

interface OrderDetailsModalProps {
  order: OrderDetail;
  isOpen: boolean;
  onClose: () => void;
}

const TRACKING_STEPS = [
  "Your order has been received",
  "Order accepted by vendor",
  "Rider is on his way",
  "Order in transit",
  "Order delivered successfully",
];

function getCompletedStep(status: string): number {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "PENDING": return 0;
    case "PAID": return 1;
    case "SHIPPED": return 2;
    case "IN_TRANSIT": return 3;
    case "DELIVERED": return 4;
    case "REJECTED": return 0;
    case "CANCELLED": return 0;
    default: return 0;
  }
}

function formatStepDate(dateString?: string | null) {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  
  return `${day}/${month}/${year} at ${hours}:${minutes} ${ampm}`;
}

function safeRender(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" || typeof value === "number") return String(value);

  if (typeof value === "object") {
    if (Array.isArray(value)) return value.join(", ");
    const record = value as Record<string, unknown>;
    if (record.name) return String(record.name);
    if (record.first_name) return `${record.first_name} ${record.last_name || ""}`.trim();
    if (record.email) return String(record.email);
    if (record.address) return String(record.address);
    if (record.street) return `${record.street}, ${record.city || ""}`.trim();
    return JSON.stringify(record);
  }

  return "—";
}

function formatCurrency(amount: string | number, currency: string) {
  const normalizedCurrency = currency === "GBP" ? "GBP" : "NGN";
  return new Intl.NumberFormat(
    normalizedCurrency === "GBP" ? "en-GB" : "en-NG",
    { style: "currency", currency: normalizedCurrency },
  ).format(Number(amount) || 0);
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const safeStatus = order.status || "PENDING";
  const completedStep = getCompletedStep(safeStatus);
  const currency = order.shipping_currency || "NGN";

  const stepTimestamps = [
    order?.created_at,             
    order?.created_at,             
    order?.shipped_at,             
    order?.shipped_at,             
    order?.delivery_confirmed_at   
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Order details</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                Order ID: {order?.id ? displayOrderId(order.id) : "—"}
              </span>
              <StatusPill status={safeStatus} />
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
            <X size={13} className="text-white" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Customer</p>
              <p className="text-sm font-medium text-foreground">{safeRender(order?.customer)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Created by</p>
              <p className="text-sm font-medium text-foreground">{safeRender(order?.creator)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Shipping Address</p>
            <p className="text-sm font-medium text-foreground line-clamp-2">{safeRender(order?.shipping_address)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(order.total_amount, currency)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">VAT</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(order.vat_amount, currency)}</p>
            </div>
          </div>

          {order?.tracking_number && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Tracking Number</p>
                <p className="text-sm font-medium text-foreground">{safeRender(order.tracking_number)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Carrier</p>
                <p className="text-sm font-medium text-foreground">{safeRender(order.carrier_name)}</p>
              </div>
            </div>
          )}

          {order?.payment_reference && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Payment Reference</p>
              <p className="text-sm font-medium text-foreground">{safeRender(order.payment_reference)}</p>
            </div>
          )}

          <div className="border-t border-border" />

          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              {Array.isArray(order?.items) ? order.items.length : Number(order?.items_count || 0)} item(s)
            </p>
            <div className="flex flex-col gap-3">
              {Array.isArray(order?.items) && order.items.map((item: OrderItem, i: number) => (
                <div key={item.id || i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden flex items-center justify-center text-xs text-muted-foreground">
                    {item.image && typeof item.image === "string" ? <img src={item.image} alt="Item" className="w-full h-full object-cover" /> : "img"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{safeRender(item.name) || "Unknown Item"}</p>
                    <p className="text-xs text-muted-foreground truncate">{safeRender(item.variant) || "Standard"}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground shrink-0">{formatCurrency(item.price, currency)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          <div>
            <p className="text-sm font-medium text-foreground mb-4">Order Tracking</p>
            <div className="flex flex-col gap-0">
              {TRACKING_STEPS.map((step, index) => {
                const isDone = index <= completedStep;
                const formattedDate = formatStepDate(stepTimestamps[index]);
                return (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${isDone ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                      {index < TRACKING_STEPS.length - 1 && (
                        <div className={`w-px flex-1 my-1 ${isDone ? "bg-green-300" : "bg-muted-foreground/20"}`} style={{ minHeight: "24px" }} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm ${isDone ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step}</p>
                      {isDone && formattedDate ? (
                         <p className="text-xs text-green-700 font-medium mt-0.5">{formattedDate}</p>
                      ) : !isDone ? (
                        <p className="text-xs text-muted-foreground mt-0.5">Pending update</p>
                      ) : null}
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

function displayOrderId(id: string) {
  return id.startsWith("demo-order-")
    ? id.slice("demo-order-".length).toUpperCase()
    : id.split("-")[0].toUpperCase();
}

function StatusPill({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    PENDING: "bg-orange-100 text-orange-700",
    IN_TRANSIT: "bg-green-100 text-green-700",
    DELIVERED: "bg-purple-100 text-purple-700",
    REJECTED: "bg-red-100 text-red-600",
    CANCELLED: "bg-gray-100 text-gray-600",
    PAID: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-cyan-100 text-cyan-700",
  };
  
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}