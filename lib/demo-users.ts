import { User, UserRole, UserStatus } from "@/types/user";

const STORAGE_PREFIX = "pearly_demo_users";
const USER_ROLES: UserRole[] = ["user", "seller", "influencer"];
const USER_STATUSES: UserStatus[] = ["active", "suspended", "pending", "inactive"];

const SAMPLE_USERS: User[] = [
  {
    id: 201,
    user_id: "demo-user-201",
    first_name: "Avery",
    last_name: "Brooks",
    name: "Avery Brooks",
    email: "avery.brooks@example.test",
    status: "active",
    is_active: true,
    date_joined: "2026-09-24T09:00:00.000Z",
    phone_number: "+234 801 555 0201",
    bio: "A customer who enjoys independent makers.",
    role: "user",
  },
  {
    id: 202,
    user_id: "demo-user-202",
    first_name: "Jordan",
    last_name: "Lee",
    name: "Jordan Lee",
    email: "jordan.lee@example.test",
    status: "active",
    is_active: true,
    date_joined: "2026-09-20T11:30:00.000Z",
    phone_number: "+234 801 555 0202",
    bio: "Ceramic artist and small business owner.",
    role: "seller",
  },
  {
    id: 203,
    user_id: "demo-user-203",
    first_name: "Morgan",
    last_name: "Patel",
    name: "Morgan Patel",
    email: "morgan.patel@example.test",
    status: "pending",
    is_active: false,
    date_joined: "2026-09-18T14:15:00.000Z",
    role: "seller",
  },
  {
    id: 204,
    user_id: "demo-user-204",
    first_name: "Casey",
    last_name: "Morgan",
    name: "Casey Morgan",
    email: "casey.morgan@example.test",
    status: "suspended",
    is_active: false,
    date_joined: "2026-09-12T08:45:00.000Z",
    role: "influencer",
  },
];

function storageKey(mode: "sample" | "empty") {
  return `${STORAGE_PREFIX}_${mode}`;
}

function isDemoUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    typeof user.user_id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string" &&
    typeof user.first_name === "string" &&
    typeof user.last_name === "string" &&
    typeof user.date_joined === "string" &&
    typeof user.is_active === "boolean" &&
    typeof user.role === "string" &&
    USER_ROLES.includes(user.role as UserRole) &&
    typeof user.status === "string" &&
    USER_STATUSES.includes(user.status as UserStatus)
  );
}

export function getDemoUsers(mode: "sample" | "empty"): User[] {
  const serialized = window.localStorage.getItem(storageKey(mode));
  if (serialized === null) {
    return mode === "sample" ? SAMPLE_USERS : [];
  }

  let saved: unknown;
  try {
    saved = JSON.parse(serialized);
  } catch {
    throw new Error("Saved demo users are invalid JSON. Clear this mode's demo data to continue.");
  }
  if (!Array.isArray(saved) || !saved.every(isDemoUser)) {
    throw new Error("Saved demo users have an invalid structure. Clear this mode's demo data to continue.");
  }
  return saved;
}

export function saveDemoUsers(
  mode: "sample" | "empty",
  users: User[],
): void {
  window.localStorage.setItem(storageKey(mode), JSON.stringify(users));
}

export function toDemoUser(input: {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  existingUser?: User;
}): User {
  const [first_name, ...lastNameParts] = input.name.trim().split(/\s+/);
  return {
    id: input.existingUser?.id ?? Date.now(),
    user_id: input.existingUser?.user_id ?? `demo-user-${Date.now()}`,
    first_name,
    last_name: lastNameParts.join(" "),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    status: input.status,
    is_active: input.status === "active",
    date_joined: input.existingUser?.date_joined ?? new Date().toISOString(),
    phone_number: input.existingUser?.phone_number,
    bio: input.existingUser?.bio,
  };
}
