import { Order, OrderDetail, OrderStatus } from "@/types/order";

const STORAGE_PREFIX = "pearly_demo_orders";
const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
];

const SAMPLE_ORDERS: OrderDetail[] = [
  {
    id: "demo-order-1048",
    customer: "Avery Brooks",
    creator: "Mina Studio",
    items: [{ id: "item-1048", name: "Everyday linen tote", variant: "Natural", price: 28000 }],
    total_amount: "32000.00",
    items_total: "28000.00",
    vat_amount: "2000.00",
    status: "IN_TRANSIT",
    shipping_address: "24 Adeola Odeku Street, Victoria Island, Lagos",
    payment_reference: "PAY-DEMO-1048",
    escrow_reference: "ESC-DEMO-1048",
    delivery_confirmed_at: "",
    delivery_confirmed_by: "",
    items_count: 1,
    is_escrow_active: true,
    tracking_number: "TRK-1048-GB",
    carrier_name: "Parcel Path",
    carrier_slug: "parcel-path",
    carrier_logo: "",
    tracking_url: "",
    shipped_at: "2026-09-28T10:00:00.000Z",
    shipping_cost: "2000.00",
    shipping_currency: "NGN",
    created_at: "2026-09-27T09:30:00.000Z",
    updated_at: "2026-09-28T10:00:00.000Z",
  },
  {
    id: "demo-order-1047",
    customer: "Jordan Lee",
    creator: "Clay & Co.",
    items: [{ id: "item-1047", name: "Speckled stoneware mug", variant: "Moss glaze", price: 34000 }],
    total_amount: "38000.00",
    items_total: "34000.00",
    vat_amount: "2000.00",
    status: "DELIVERED",
    shipping_address: "8 Awolowo Road, Ikoyi, Lagos",
    payment_reference: "PAY-DEMO-1047",
    escrow_reference: "ESC-DEMO-1047",
    delivery_confirmed_at: "2026-09-25T15:00:00.000Z",
    delivery_confirmed_by: "Jordan Lee",
    items_count: 1,
    is_escrow_active: false,
    tracking_number: "TRK-1047-GB",
    carrier_name: "Parcel Path",
    carrier_slug: "parcel-path",
    carrier_logo: "",
    tracking_url: "",
    shipped_at: "2026-09-23T10:00:00.000Z",
    shipping_cost: "2000.00",
    shipping_currency: "NGN",
    created_at: "2026-09-22T13:15:00.000Z",
    updated_at: "2026-09-25T15:00:00.000Z",
  },
  {
    id: "demo-order-1046",
    customer: "Morgan Patel",
    creator: "Sunday Goods",
    items: [{ id: "item-1046", name: "Botanical soy candle", variant: "Cedar & sage", price: 22000 }],
    total_amount: "25000.00",
    items_total: "22000.00",
    vat_amount: "1000.00",
    status: "PENDING",
    shipping_address: "51 Admiralty Way, Lekki Phase 1, Lagos",
    payment_reference: "PAY-DEMO-1046",
    escrow_reference: "ESC-DEMO-1046",
    delivery_confirmed_at: "",
    delivery_confirmed_by: "",
    items_count: 1,
    is_escrow_active: true,
    tracking_number: "",
    carrier_name: "",
    carrier_slug: "",
    carrier_logo: "",
    tracking_url: "",
    shipped_at: "",
    shipping_cost: "2000.00",
    shipping_currency: "NGN",
    created_at: "2026-09-20T08:45:00.000Z",
    updated_at: "2026-09-20T08:45:00.000Z",
  },
  {
    id: "demo-order-1045",
    customer: "Casey Morgan",
    creator: "Mina Studio",
    items: [
      { id: "item-1045-a", name: "Everyday linen tote", variant: "Olive", price: 28000 },
      { id: "item-1045-b", name: "Everyday linen tote", variant: "Natural", price: 28000 },
    ],
    total_amount: "60000.00",
    items_total: "56000.00",
    vat_amount: "2000.00",
    status: "PAID",
    shipping_address: "12 Herbert Macaulay Way, Yaba, Lagos",
    payment_reference: "PAY-DEMO-1045",
    escrow_reference: "ESC-DEMO-1045",
    delivery_confirmed_at: "",
    delivery_confirmed_by: "",
    items_count: 2,
    is_escrow_active: true,
    tracking_number: "",
    carrier_name: "",
    carrier_slug: "",
    carrier_logo: "",
    tracking_url: "",
    shipped_at: "",
    shipping_cost: "2000.00",
    shipping_currency: "NGN",
    created_at: "2026-09-18T16:20:00.000Z",
    updated_at: "2026-09-18T16:20:00.000Z",
  },
];

function storageKey(mode: "sample" | "empty"): string {
  return `${STORAGE_PREFIX}_${mode}`;
}

function isOrderDetail(value: unknown): value is OrderDetail {
  if (typeof value !== "object" || value === null) return false;
  const order = value as Record<string, unknown>;
  return (
    typeof order.id === "string" &&
    typeof order.customer === "string" &&
    typeof order.total_amount === "string" &&
    typeof order.items_count === "number" &&
    Array.isArray(order.items) &&
    typeof order.status === "string" &&
    ORDER_STATUSES.includes(order.status as OrderStatus)
  );
}

export function getDemoOrders(mode: "sample" | "empty"): OrderDetail[] {
  const serialized = window.localStorage.getItem(storageKey(mode));
  if (serialized === null) {
    return mode === "sample" ? SAMPLE_ORDERS : [];
  }

  let saved: unknown;
  try {
    saved = JSON.parse(serialized);
  } catch {
    throw new Error("Saved demo orders are invalid JSON");
  }
  if (!Array.isArray(saved) || !saved.every(isOrderDetail)) {
    throw new Error("Saved demo orders have an invalid Json.");
  }
  if (mode === "empty") return saved;

  const sampleOrdersById = new Map(SAMPLE_ORDERS.map((order) => [order.id, order]));
  return saved.map((order) => {
    const sample = sampleOrdersById.get(order.id);
    if (!sample) return order;
    return {
      ...sample,
      ...order,
      items: order.items.map((item) => {
        const sampleItem = sample.items.find((candidate) => candidate.id === item.id);
        return sampleItem ? { ...item, price: sampleItem.price } : item;
      }),
      total_amount: sample.total_amount,
      items_total: sample.items_total,
      vat_amount: sample.vat_amount,
      shipping_cost: sample.shipping_cost,
      shipping_currency: "NGN",
      shipping_address: sample.shipping_address,
    };
  });
}

export function saveDemoOrders(
  mode: "sample" | "empty",
  orders: OrderDetail[],
): void {
  window.localStorage.setItem(storageKey(mode), JSON.stringify(orders));
}

export function toOrderList(order: OrderDetail): Order {
  return {
    id: order.id,
    customer: order.customer,
    customer_email: "",
    total_amount: order.total_amount,
    items_count: String(order.items_count),
    status: order.status,
    created_at: order.created_at,
    updated_at: order.updated_at,
  };
}
