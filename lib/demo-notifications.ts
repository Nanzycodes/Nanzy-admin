import type { Notification } from "@/lib/notifications-api";

export type NotificationChannel = "email" | "push" | "in_app" | "sms";
export type NotificationStatus =
  | "delivered"
  | "sent"
  | "queued"
  | "scheduled"
  | "failed"
  | "cancelled";
export type NotificationAudience =
  | "all_customers"
  | "active_sellers"
  | "influencers"
  | "new_customers";

export interface DemoNotification {
  id: string;
  name: string;
  subject: string;
  message: string;
  channel: NotificationChannel;
  audience: NotificationAudience;
  status: NotificationStatus;
  recipientCount: number;
  deliveredCount: number;
  openedCount: number;
  failedCount: number;
  createdAt: string;
  scheduledAt: string | null;
  provider: string;
  providerMessageId: string | null;
  failureReason: string | null;
  attemptCount: number;
}

export interface DemoNotificationInput {
  name: string;
  subject: string;
  message: string;
  channel: NotificationChannel;
  audience: NotificationAudience;
  scheduledAt: string | null;
}

const STORAGE_PREFIX = "pearly_demo_notifications";
const ALERT_STORAGE_PREFIX = "pearly_demo_admin_alerts";
const CHANNELS: NotificationChannel[] = ["email", "push", "in_app", "sms"];
const STATUSES: NotificationStatus[] = [
  "delivered",
  "sent",
  "queued",
  "scheduled",
  "failed",
  "cancelled",
];
const AUDIENCES: NotificationAudience[] = [
  "all_customers",
  "active_sellers",
  "influencers",
  "new_customers",
];

const SAMPLE_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "ntf-2026-1048",
    name: "October marketplace highlights",
    subject: "Fresh finds from independent makers",
    message:
      "Discover this week's customer favorites and new arrivals from independent makers.",
    channel: "email",
    audience: "all_customers",
    status: "delivered",
    recipientCount: 12480,
    deliveredCount: 12311,
    openedCount: 4862,
    failedCount: 169,
    createdAt: "2026-10-04T10:30:00.000Z",
    scheduledAt: null,
    provider: "Email delivery",
    providerMessageId: "msg_demo_7f3c91",
    failureReason: null,
    attemptCount: 1,
  },
  {
    id: "ntf-2026-1047",
    name: "Seller payout reminder",
    subject: "Your weekly payout is ready",
    message:
      "Your latest marketplace earnings are ready. Review your payout details in your seller dashboard.",
    channel: "email",
    audience: "active_sellers",
    status: "sent",
    recipientCount: 1286,
    deliveredCount: 1261,
    openedCount: 903,
    failedCount: 25,
    createdAt: "2026-10-03T08:00:00.000Z",
    scheduledAt: null,
    provider: "Email delivery",
    providerMessageId: "msg_demo_6a2b14",
    failureReason: null,
    attemptCount: 1,
  },
  {
    id: "ntf-2026-1046",
    name: "Order dispatch update",
    subject: "Your order is on its way",
    message:
      "A seller has dispatched your order. Open your order details to follow its progress.",
    channel: "push",
    audience: "all_customers",
    status: "delivered",
    recipientCount: 342,
    deliveredCount: 338,
    openedCount: 211,
    failedCount: 4,
    createdAt: "2026-10-02T16:25:00.000Z",
    scheduledAt: null,
    provider: "Push delivery",
    providerMessageId: "push_demo_81ca02",
    failureReason: null,
    attemptCount: 1,
  },
  {
    id: "ntf-2026-1045",
    name: "Creator program announcement",
    subject: "New ways to earn with Nanzy",
    message:
      "Explore the latest creator program opportunities and see how to get started.",
    channel: "in_app",
    audience: "influencers",
    status: "queued",
    recipientCount: 516,
    deliveredCount: 0,
    openedCount: 0,
    failedCount: 0,
    createdAt: "2026-10-05T09:15:00.000Z",
    scheduledAt: null,
    provider: "In-app delivery",
    providerMessageId: null,
    failureReason: null,
    attemptCount: 0,
  },
  {
    id: "ntf-2026-1044",
    name: "Welcome series: first purchase",
    subject: "A little welcome gift for your first order",
    message:
      "Thanks for joining the marketplace. Browse something special and enjoy your first-purchase offer.",
    channel: "sms",
    audience: "new_customers",
    status: "failed",
    recipientCount: 82,
    deliveredCount: 0,
    openedCount: 0,
    failedCount: 82,
    createdAt: "2026-10-01T12:45:00.000Z",
    scheduledAt: null,
    provider: "SMS delivery",
    providerMessageId: "sms_demo_22b1de",
    failureReason: "Provider throttled this batch. Retry after the rate limit clears.",
    attemptCount: 1,
  },
  {
    id: "ntf-2026-1043",
    name: "New season collection launch",
    subject: "Meet the new season collection",
    message:
      "A new collection is here. See the latest pieces from marketplace sellers.",
    channel: "email",
    audience: "all_customers",
    status: "delivered",
    recipientCount: 11902,
    deliveredCount: 11788,
    openedCount: 3956,
    failedCount: 114,
    createdAt: "2026-09-29T11:00:00.000Z",
    scheduledAt: null,
    provider: "Email delivery",
    providerMessageId: "msg_demo_430f80",
    failureReason: null,
    attemptCount: 1,
  },
  {
    id: "ntf-2026-1042",
    name: "Seller onboarding tips",
    subject: "Three tips to set up your shop",
    message:
      "Complete your shop profile, add clear product photos, and share your returns policy.",
    channel: "in_app",
    audience: "active_sellers",
    status: "delivered",
    recipientCount: 1240,
    deliveredCount: 1228,
    openedCount: 746,
    failedCount: 12,
    createdAt: "2026-09-26T13:20:00.000Z",
    scheduledAt: null,
    provider: "In-app delivery",
    providerMessageId: "inapp_demo_593cc2",
    failureReason: null,
    attemptCount: 1,
  },
  {
    id: "ntf-2026-1041",
    name: "October seller education session",
    subject: "Live session: grow your marketplace shop",
    message:
      "Join the seller education session for practical tips on presenting and promoting your products.",
    channel: "email",
    audience: "active_sellers",
    status: "scheduled",
    recipientCount: 1286,
    deliveredCount: 0,
    openedCount: 0,
    failedCount: 0,
    createdAt: "2026-10-05T08:20:00.000Z",
    scheduledAt: "2026-10-08T10:00:00.000Z",
    provider: "Email delivery",
    providerMessageId: null,
    failureReason: null,
    attemptCount: 0,
  },
];

const SAMPLE_ADMIN_ALERTS: Notification[] = [
  {
    id: "alert-demo-301",
    category: "orders",
    title: "New order",
    message: "Order ORD-2048 was placed and is awaiting seller confirmation.",
    data: { order_id: "ORD-2048" },
    is_read: false,
    created_at: "2026-10-05T09:42:00.000Z",
  },
  {
    id: "alert-demo-302",
    category: "payments",
    title: "Payout needs review",
    message: "A seller payout failed and may need attention.",
    data: { transaction_id: "DEMO-PAYOUT-504" },
    is_read: false,
    created_at: "2026-10-04T14:18:00.000Z",
  },
  {
    id: "alert-demo-303",
    category: "users",
    title: "Seller onboarding",
    message: "A new seller application is ready for review.",
    data: { user_id: "demo-user-203" },
    is_read: true,
    created_at: "2026-10-03T11:30:00.000Z",
  },
];

function storageKey(mode: "sample" | "empty"): string {
  return `${STORAGE_PREFIX}_${mode}`;
}

function alertStorageKey(mode: "sample" | "empty"): string {
  return `${ALERT_STORAGE_PREFIX}_${mode}`;
}

function isAdminAlert(value: unknown): value is Notification {
  if (typeof value !== "object" || value === null) return false;
  const alert = value as Record<string, unknown>;
  return (
    typeof alert.id === "string" &&
    typeof alert.category === "string" &&
    typeof alert.title === "string" &&
    typeof alert.message === "string" &&
    typeof alert.is_read === "boolean" &&
    typeof alert.created_at === "string"
  );
}

export function getDemoAdminAlerts(mode: "sample" | "empty"): Notification[] {
  const serialized = window.localStorage.getItem(alertStorageKey(mode));
  if (serialized === null) {
    return mode === "sample" ? SAMPLE_ADMIN_ALERTS : [];
  }
  let saved: unknown;
  try {
    saved = JSON.parse(serialized);
  } catch {
    throw new Error("Saved demo alerts are invalid JSON.");
  }
  if (!Array.isArray(saved) || !saved.every(isAdminAlert)) {
    throw new Error("saved data for demo alerts not a real data.for real data we will have to use real APIA");
  }
  return saved;
}

export function saveDemoAdminAlerts(
  mode: "sample" | "empty",
  alerts: Notification[],
): void {
  window.localStorage.setItem(alertStorageKey(mode), JSON.stringify(alerts));
}

function isNotification(value: unknown): value is DemoNotification {
  if (typeof value !== "object" || value === null) return false;
  const notification = value as Record<string, unknown>;
  return (
    typeof notification.id === "string" &&
    typeof notification.name === "string" &&
    typeof notification.subject === "string" &&
    typeof notification.message === "string" &&
    typeof notification.channel === "string" &&
    CHANNELS.includes(notification.channel as NotificationChannel) &&
    typeof notification.audience === "string" &&
    AUDIENCES.includes(notification.audience as NotificationAudience) &&
    typeof notification.status === "string" &&
    STATUSES.includes(notification.status as NotificationStatus) &&
    ["recipientCount", "deliveredCount", "openedCount", "failedCount", "attemptCount"].every(
      (key) => typeof notification[key] === "number",
    ) &&
    typeof notification.createdAt === "string" &&
    (notification.scheduledAt === null || typeof notification.scheduledAt === "string") &&
    typeof notification.provider === "string" &&
    (notification.providerMessageId === null ||
      typeof notification.providerMessageId === "string") &&
    (notification.failureReason === null || typeof notification.failureReason === "string")
  );
}

export function getDemoNotifications(mode: "sample" | "empty"): DemoNotification[] {
  const serialized = window.localStorage.getItem(storageKey(mode));
  if (serialized === null) {
    return mode === "sample" ? SAMPLE_NOTIFICATIONS : [];
  }

  let saved: unknown;
  try {
    saved = JSON.parse(serialized);
  } catch {
    throw new Error(
      "Saved demo notifications are invalid JSON. Clear this mode's demo data to continue.",
    );
  }
  if (!Array.isArray(saved) || !saved.every(isNotification)) {
    throw new Error(
      "Saved demo notifications have an invalid structure. Clear this mode's demo data to continue.",
    );
  }
  return saved;
}

export function saveDemoNotifications(
  mode: "sample" | "empty",
  notifications: DemoNotification[],
): void {
  window.localStorage.setItem(storageKey(mode), JSON.stringify(notifications));
}

export function createDemoNotification(
  input: DemoNotificationInput,
): DemoNotification {
  const now = new Date().toISOString();
  const scheduledAt = input.scheduledAt;
  const isScheduled = scheduledAt !== null && new Date(scheduledAt).getTime() > Date.now();

  return {
    id: `ntf-demo-${crypto.randomUUID()}`,
    name: input.name.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    channel: input.channel,
    audience: input.audience,
    status: isScheduled ? "scheduled" : "queued",
    recipientCount: audienceSize(input.audience),
    deliveredCount: 0,
    openedCount: 0,
    failedCount: 0,
    createdAt: now,
    scheduledAt: isScheduled ? scheduledAt : null,
    provider: providerFor(input.channel),
    providerMessageId: null,
    failureReason: null,
    attemptCount: 0,
  };
}

export function audienceSize(audience: NotificationAudience): number {
  const audienceSizes: Record<NotificationAudience, number> = {
    all_customers: 12480,
    active_sellers: 1286,
    influencers: 516,
    new_customers: 342,
  };
  return audienceSizes[audience];
}

export function providerFor(channel: NotificationChannel): string {
  const providers: Record<NotificationChannel, string> = {
    email: "Email delivery",
    push: "Push delivery",
    in_app: "In-app delivery",
    sms: "SMS delivery",
  };
  return providers[channel];
}
