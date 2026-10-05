"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Mail,
  MessageSquare,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Smartphone,
  X,
} from "lucide-react";
import {
  audienceSize,
  DemoNotification,
  DemoNotificationInput,
  NotificationAudience,
  NotificationChannel,
  NotificationStatus,
} from "@/lib/demo-notifications";

const STATUS_OPTIONS: { label: string; value: NotificationStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Delivered", value: "delivered" },
  { label: "Sent", value: "sent" },
  { label: "Queued", value: "queued" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const CHANNEL_OPTIONS: { label: string; value: NotificationChannel }[] = [
  { label: "Email", value: "email" },
  { label: "Push", value: "push" },
  { label: "In-app", value: "in_app" },
  { label: "SMS", value: "sms" },
];

const AUDIENCE_OPTIONS: { label: string; value: NotificationAudience }[] = [
  { label: "All customers", value: "all_customers" },
  { label: "Active sellers", value: "active_sellers" },
  { label: "Influencers", value: "influencers" },
  { label: "New customers", value: "new_customers" },
];

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ChannelIcon({ channel, size = 16 }: { channel: NotificationChannel; size?: number }) {
  if (channel === "email") return <Mail size={size} />;
  if (channel === "push") return <Smartphone size={size} />;
  if (channel === "sms") return <MessageSquare size={size} />;
  return <Bell size={size} />;
}

function StatusBadge({ status }: { status: NotificationStatus }) {
  const styles: Record<NotificationStatus, string> = {
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
    queued: "bg-amber-50 text-amber-800 border-amber-200",
    scheduled: "bg-violet-50 text-violet-700 border-violet-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
    cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {formatLabel(status)}
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F1F0FF] text-[#635BFF]">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function NotificationDetails({
  notification,
  onClose,
  onRetry,
  onCancelSchedule,
}: {
  notification: DemoNotification;
  onClose: () => void;
  onRetry: (id: string) => void;
  onCancelSchedule: (id: string) => void;
}) {
  const deliveryRate =
    notification.recipientCount === 0
      ? 0
      : Math.round((notification.deliveredCount / notification.recipientCount) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Delivery record · {notification.id}
            </p>
            <h2 id="notification-details-title" className="mt-1 text-lg font-semibold">
              {notification.name}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close details" className="rounded-md p-2 hover:bg-muted">
            <X size={18} />
          </button>
        </header>
        <div className="space-y-6 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ChannelIcon channel={notification.channel} />
              <span>{formatLabel(notification.channel)}</span>
              <span aria-hidden="true">·</span>
              <span>{formatLabel(notification.audience)}</span>
            </div>
            <StatusBadge status={notification.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Recipients", notification.recipientCount.toLocaleString()],
              ["Delivered", notification.deliveredCount.toLocaleString()],
              ["Opened", notification.openedCount.toLocaleString()],
              ["Failed", notification.failedCount.toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Delivery progress</span>
              <span className="text-muted-foreground">{deliveryRate}% delivered</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${deliveryRate}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {notification.channel === "email" ? "Subject" : "Message"}
            </p>
            {notification.channel === "email" && (
              <p className="mt-2 font-medium">{notification.subject}</p>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {notification.message}
            </p>
          </div>

          {notification.failureReason && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <p className="font-semibold">Delivery issue</p>
              <p className="mt-1">{notification.failureReason}</p>
              <p className="mt-2 text-xs">Attempts: {notification.attemptCount}</p>
            </div>
          )}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Created</dt>
              <dd className="mt-1">{formatDate(notification.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Scheduled</dt>
              <dd className="mt-1">{formatDate(notification.scheduledAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Delivery provider</dt>
              <dd className="mt-1">{notification.provider}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Provider message ID</dt>
              <dd className="mt-1 break-all font-mono text-xs">
                {notification.providerMessageId ?? "Not assigned"}
              </dd>
            </div>
          </dl>
        </div>
        <footer className="flex justify-end gap-2 border-t border-border px-6 py-4">
          {notification.status === "failed" && (
            <button
              onClick={() => onRetry(notification.id)}
              className="inline-flex items-center gap-2 rounded-md bg-[#635BFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#5148e5]"
            >
              <RotateCcw size={15} /> Retry in demo
            </button>
          )}
          {notification.status === "scheduled" && (
            <button
              onClick={() => onCancelSchedule(notification.id)}
              className="rounded-md border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Cancel scheduled send
            </button>
          )}
          <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

function CampaignComposer({
  onClose,
  onCreate,
  minSchedule,
}: {
  onClose: () => void;
  onCreate: (input: DemoNotificationInput) => void;
  minSchedule: string;
}) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<NotificationChannel>("email");
  const [audience, setAudience] = useState<NotificationAudience>("all_customers");
  const [scheduleFor, setScheduleFor] = useState("");
  const [error, setError] = useState("");
  const needsSubject = channel === "email";

  function submit(schedule: boolean) {
    if (!name.trim() || !message.trim() || (needsSubject && !subject.trim())) {
      setError("Complete the campaign name, message, and email subject before continuing.");
      return;
    }
    let scheduledAt: string | null = null;
    if (schedule) {
      const scheduledDate = new Date(scheduleFor);
      if (!scheduleFor || Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() < Date.now() + 5 * 60_000) {
        setError("Choose a scheduled time at least five minutes from now.");
        return;
      }
      scheduledAt = scheduledDate.toISOString();
    }
    onCreate({
      name: name.trim(),
      subject: needsSubject ? subject.trim() : "",
      message: message.trim(),
      channel,
      audience,
      scheduledAt,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-composer-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="border-b border-border px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Campaign builder</p>
          <h2 id="campaign-composer-title" className="mt-1 text-lg font-semibold">Create notification</h2>
        </header>
        <div className="space-y-4 px-6 py-5">
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            Demo only: this creates a local campaign record. It does not contact recipients or a delivery provider.
          </p>
          <label className="block text-sm font-medium">
            Campaign name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              className="mt-1 h-10 w-full rounded-md border border-border px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. New collection launch"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Channel
              <select
                value={channel}
                onChange={(event) => setChannel(event.target.value as NotificationChannel)}
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 font-normal"
              >
                {CHANNEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Audience
              <select
                value={audience}
                onChange={(event) => setAudience(event.target.value as NotificationAudience)}
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 font-normal"
              >
                {AUDIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Estimated audience: <span className="font-semibold text-foreground">{audienceSize(audience).toLocaleString()}</span> recipients
          </div>
          {needsSubject && (
            <label className="block text-sm font-medium">
              Email subject
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={120}
                className="mt-1 h-10 w-full rounded-md border border-border px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                placeholder="Write a clear subject line"
              />
            </label>
          )}
          <label className="block text-sm font-medium">
            Message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1000}
              rows={5}
              className="mt-1 w-full resize-y rounded-md border border-border p-3 font-normal outline-none focus:ring-2 focus:ring-ring"
              placeholder="Write the message recipients will receive"
            />
            <span className="mt-1 block text-right text-xs font-normal text-muted-foreground">
              {message.length}/1000
            </span>
          </label>
          <label className="block text-sm font-medium">
            Schedule (optional)
            <input
              type="datetime-local"
              min={minSchedule}
              value={scheduleFor}
              onChange={(event) => setScheduleFor(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-border px-3 font-normal"
            />
          </label>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        </div>
        <footer className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">
          <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button
            onClick={() => submit(Boolean(scheduleFor))}
            className="rounded-md bg-[#635BFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#5148e5]"
          >
            {scheduleFor ? "Schedule locally" : "Add to demo queue"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default function NotificationsWorkspace({
  notifications,
  onCreate,
  onRetry,
  onCancelSchedule,
  loading,
  error,
  isDemo,
}: {
  notifications: DemoNotification[];
  onCreate: (input: DemoNotificationInput) => boolean;
  onRetry: (id: string) => void;
  onCancelSchedule: (id: string) => void;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<NotificationStatus | "all">("all");
  const [channel, setChannel] = useState<NotificationChannel | "all">("all");
  const [selected, setSelected] = useState<DemoNotification | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [minSchedule, setMinSchedule] = useState("");

  const filtered = useMemo(
    () =>
      notifications
        .filter((item) => status === "all" || item.status === status)
        .filter((item) => channel === "all" || item.channel === channel)
        .filter((item) =>
          `${item.name} ${item.subject} ${item.message} ${item.id} ${item.audience}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications, search, status, channel],
  );

  const totalRecipients = notifications.reduce(
    (total, item) => total + item.deliveredCount + item.failedCount,
    0,
  );
  const totalDelivered = notifications.reduce((total, item) => total + item.deliveredCount, 0);
  const deliveryRate = totalRecipients
    ? `${Math.round((totalDelivered / totalRecipients) * 100)}%`
    : "0%";
  const queuedCount = notifications.filter((item) => item.status === "queued").length;
  const failedCount = notifications.filter((item) => item.status === "failed").length;
  const recentDelivered = notifications
    .filter((item) => item.status === "delivered")
    .reduce((total, item) => total + item.deliveredCount, 0);
  const openRate = recentDelivered
    ? `${Math.round(
        (notifications.reduce((total, item) => total + item.openedCount, 0) /
          recentDelivered) *
          100,
      )}%`
    : "0%";

  function handleRetry(id: string) {
    onRetry(id);
    setSelected(null);
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-[28px] font-bold">Notifications</h1>
          <p className="mt-1 text-base text-[#616161]">
            Review delivery health and manage customer communications.
          </p>
        </div>
        <button
          onClick={() => {
            setMinSchedule(new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16));
            setShowComposer(true);
          }}
          disabled={!isDemo}
          title={!isDemo ? "Connect a production delivery service to create campaigns." : undefined}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#635BFF] px-4 text-sm font-medium text-white hover:bg-[#5148e5] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} /> Create notification
        </button>
      </div>

      {isDemo && (
        <div className="mb-5 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>
            Sample delivery history is for demonstration only. Creating or retrying campaigns updates this browser only; nothing is sent.
          </p>
        </div>
      )}
      {!isDemo && (
        <div className="mb-5 flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>
            Production notifications are not connected to a delivery provider. Delivery actions are disabled; enter demo mode to explore the local workflow.
          </p>
        </div>
      )}
      {error && (
        <div role="alert" className="mb-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Delivery rate"
          value={deliveryRate}
          hint={`${totalDelivered.toLocaleString()} delivered of ${totalRecipients.toLocaleString()} recipients`}
          icon={<CheckCircle2 size={19} />}
        />
        <MetricCard
          label="Open rate"
          value={openRate}
          hint="Opens compared with delivered messages"
          icon={<Eye size={19} />}
        />
        <MetricCard
          label="In queue"
          value={queuedCount.toLocaleString()}
          hint="Campaigns awaiting processing"
          icon={<Clock3 size={19} />}
        />
        <MetricCard
          label="Failed campaigns"
          value={failedCount.toLocaleString()}
          hint="Review provider errors and retry when ready"
          icon={<AlertCircle size={19} />}
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4">
          <div>
            <h2 className="font-semibold">Campaign delivery log</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {filtered.length.toLocaleString()} {filtered.length === 1 ? "campaign" : "campaigns"}
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <label className="relative min-w-[190px] flex-1 sm:flex-none">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search campaigns"
                aria-label="Search campaigns"
                className="h-9 w-full rounded-md border border-border pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Filter by status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as NotificationStatus | "all")}
                className="h-9 appearance-none rounded-md border border-border bg-white py-1 pl-3 pr-8 text-sm"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </label>
            <label className="relative">
              <span className="sr-only">Filter by channel</span>
              <select
                value={channel}
                onChange={(event) => setChannel(event.target.value as NotificationChannel | "all")}
                className="h-9 appearance-none rounded-md border border-border bg-white py-1 pl-3 pr-8 text-sm"
              >
                <option value="all">All channels</option>
                {CHANNEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
            <Radio size={17} className="mr-2 animate-pulse" /> Loading delivery records…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Bell size={22} />
            </span>
            <h3 className="font-semibold">No notifications found</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {notifications.length === 0
                ? isDemo
                  ? "There are no campaigns in this data mode yet. Create a local demo notification to explore the workflow."
                  : "No production delivery records are available because a notification provider is not connected."
                : "Try a different search or filter to find a campaign."}
            </p>
            {notifications.length === 0 && isDemo && (
              <button
                onClick={() => {
                  setMinSchedule(new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16));
                  setShowComposer(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <Plus size={15} /> Create notification
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Campaign</th>
                  <th className="px-4 py-3 font-medium">Channel / audience</th>
                  <th className="px-4 py-3 font-medium">Delivery</th>
                  <th className="px-4 py-3 font-medium">Recipients</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => {
                  const progress =
                    item.recipientCount === 0
                      ? 0
                      : Math.round((item.deliveredCount / item.recipientCount) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="max-w-[260px] px-4 py-4">
                        <button
                          onClick={() => setSelected(item)}
                          className="block truncate text-left font-medium text-foreground hover:text-[#635BFF]"
                        >
                          {item.name}
                        </button>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{item.subject || item.message}</p>
                        <p className="mt-1 font-mono text-[11px] text-muted-foreground">{item.id}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <ChannelIcon channel={item.channel} size={15} />
                          <span>{formatLabel(item.channel)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{formatLabel(item.audience)}</p>
                      </td>
                      <td className="min-w-[140px] px-4 py-4">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span>{item.deliveredCount.toLocaleString()} delivered</span>
                          <span className="text-muted-foreground">{progress}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                        </div>
                        {item.failedCount > 0 && (
                          <p className="mt-1 text-xs text-rose-700">{item.failedCount.toLocaleString()} failed</p>
                        )}
                      </td>
                      <td className="px-4 py-4 tabular-nums">{item.recipientCount.toLocaleString()}</td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {item.status === "scheduled" ? (
                          <>
                            <span className="block">Scheduled for</span>
                            <span>{formatDate(item.scheduledAt)}</span>
                          </>
                        ) : formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelected(item)}
                          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                          aria-label={`View ${item.name}`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Radio size={13} /> Delivery and engagement metrics shown here are illustrative demo records.
      </p>

      {selected && (
        <NotificationDetails
          notification={selected}
          onClose={() => setSelected(null)}
          onRetry={handleRetry}
          onCancelSchedule={(id) => {
            onCancelSchedule(id);
            setSelected(null);
          }}
        />
      )}
      {showComposer && (
        <CampaignComposer
          minSchedule={minSchedule}
          onClose={() => setShowComposer(false)}
          onCreate={(input) => {
            const created = onCreate(input);
            if (created) setShowComposer(false);
          }}
        />
      )}
    </>
  );
}
