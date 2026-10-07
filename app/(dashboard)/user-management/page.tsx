"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import UsersTable from "@/components/users/users-table";
import UserFormModal from "@/components/users/user-form-modal";
import UserProfileModal from "@/components/users/user-profile-modal";
import DeleteUserDialog from "@/components/users/delete-user-dialog";
import { User, UserRole, UserStatus } from "@/types/user";
import apiClient from "@/lib/apiclient";
import { subDays, subMonths, format } from "date-fns";
import {
  DemoDataMode,
  getDemoDataMode,
  isDemoSession,
  subscribeToDemoSession,
} from "@/lib/demo-mode";
import { getDemoUsers, saveDemoUsers, toDemoUser } from "@/lib/demo-users";

const TABS: { label: string; role: UserRole | "all" }[] = [
  { label: "Users", role: "all" },
  { label: "Sellers", role: "seller" },
];

export default function UsersPage() {
  const demoSession = useSyncExternalStore(
    subscribeToDemoSession,
    isDemoSession,
    () => false,
  );
  const demoDataMode = useSyncExternalStore<DemoDataMode>(
    subscribeToDemoSession,
    getDemoDataMode,
    () => "sample",
  );
  const [activeTab, setActiveTab] = useState<UserRole | "all">("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [demoUsersError, setDemoUsersError] = useState<string | null>(null);

  // ── Stat counts ──
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersSinceLastMonth, setUsersSinceLastMonth] = useState(0);

  const [activeUsers, setActiveUsers] = useState(0);
  const [activeSinceLastWeek, setActiveSinceLastWeek] = useState(0);

  const [pendingUsers, setPendingUsers] = useState(0);
  const [pendingSinceLastWeek, setPendingSinceLastWeek] = useState(0);
  const [suspendedUsers, setSuspendedUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!demoSession) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        setDemoUsers(getDemoUsers(demoDataMode));
        setDemoUsersError(null);
      } catch (error) {
        setDemoUsersError(
          error instanceof Error ? error.message : "Could not load saved demo users.",
        );
      }
    });
    return () => {
      active = false;
    };
  }, [demoSession, demoDataMode]);

  useEffect(() => {
    if (demoSession) return;
    async function fetchCounts() {
      try {
        const today = new Date();
        const lastWeek = format(subDays(today, 7), "yyyy-MM-dd");
        const lastMonth = format(subMonths(today, 1), "yyyy-MM-dd");

        const [
          totalRes,
          totalLastMonthRes,
          activeRes,
          activeLastWeekRes,
          pendingRes,
          pendingLastWeekRes,
          suspendedRes,
          inactiveRes,
        ] = await Promise.all([
          apiClient.get(`/admin/customers/?page_size=1`),
          apiClient.get(`/admin/customers/?start_date=${lastMonth}&page_size=1`),
          apiClient.get(`/admin/customers/?status=active&page_size=1`),
          apiClient.get(`/admin/customers/?status=active&start_date=${lastWeek}&page_size=1`),
          apiClient.get(`/admin/customers/?status=pending&page_size=1`),
          apiClient.get(`/admin/customers/?status=pending&start_date=${lastWeek}&page_size=1`),
          apiClient.get(`/admin/customers/?status=suspended&page_size=1`),
          apiClient.get(`/admin/customers/?status=inactive&page_size=1`),
        ]);

        function countFrom(response: { data?: unknown }): number {
          const root = response.data;
          const payload =
            typeof root === "object" && root !== null && "data" in root
              ? root.data
              : root;
          if (
            typeof payload !== "object" ||
            payload === null ||
            !("count" in payload) ||
            typeof payload.count !== "number" ||
            !Number.isFinite(payload.count)
          ) {
            throw new Error("The users API returned an invalid summary count.");
          }
          return payload.count;
        }

        setTotalUsers(countFrom(totalRes));
        setUsersSinceLastMonth(countFrom(totalLastMonthRes));

        setActiveUsers(countFrom(activeRes));
        setActiveSinceLastWeek(countFrom(activeLastWeekRes));

        setPendingUsers(countFrom(pendingRes));
        setPendingSinceLastWeek(countFrom(pendingLastWeekRes));
        setSuspendedUsers(countFrom(suspendedRes));
        setInactiveUsers(countFrom(inactiveRes));
        setStatsError(null);
      } catch (error) {
        console.error("Failed to load user summary:", error);
        setStatsError("Could not load user summary counts. Please try again.");
      }
    }
    fetchCounts();
  }, [demoSession]);

  const handleViewDetails = (user: User) => { setSelectedUser(user); setIsProfileModalOpen(true); };
  const handleEdit = (user: User) => { setSelectedUser(user); setIsEditModalOpen(true); };
  const handleDelete = (user: User) => { setSelectedUser(user); setIsDeleteDialogOpen(true); };

  function persistDemoUsers(next: User[]) {
    try {
      saveDemoUsers(demoDataMode, next);
      setDemoUsers(next);
      setDemoUsersError(null);
      return true;
    } catch (error) {
      setDemoUsersError(
        error instanceof Error ? error.message : "Could not save demo users.",
      );
      return false;
    }
  }

  function saveUser(input: {
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  }): boolean {
    const user = toDemoUser({ ...input, existingUser: selectedUser ?? undefined });
    const next = selectedUser
      ? demoUsers.map((item) => (item.user_id === user.user_id ? user : item))
      : [user, ...demoUsers];
    if (persistDemoUsers(next)) {
      setIsEditModalOpen(false);
      setSelectedUser(null);
      return true;
    }
    return false;
  }

  function updateDemoUserStatus(user: User, status: UserStatus) {
    persistDemoUsers(
      demoUsers.map((item) =>
        item.user_id === user.user_id
          ? { ...item, status, is_active: status === "active" }
          : item,
      ),
    );
  }

  function deleteDemoUser(user: User): boolean {
    if (persistDemoUsers(demoUsers.filter((item) => item.user_id !== user.user_id))) {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      return true;
    }
    return false;
  }

  const demoUsersForTab =
    activeTab === "all"
      ? demoUsers
      : demoUsers.filter((user) => user.role === activeTab);
  const statsUsers = demoSession ? demoUsers : null;
  const totalUsersValue = statsUsers?.length ?? totalUsers;
  const usersSinceLastMonthValue =
    statsUsers?.filter((user) => new Date(user.date_joined) >= subMonths(new Date(), 1)).length ??
    usersSinceLastMonth;
  const activeUsersValue =
    statsUsers?.filter((user) => user.status === "active").length ?? activeUsers;
  const activeSinceLastWeekValue =
    statsUsers?.filter(
      (user) => user.status === "active" && new Date(user.date_joined) >= subDays(new Date(), 7),
    ).length ?? activeSinceLastWeek;
  const pendingUsersValue =
    statsUsers?.filter((user) => user.status === "pending").length ?? pendingUsers;
  const pendingSinceLastWeekValue =
    statsUsers?.filter(
      (user) => user.status === "pending" && new Date(user.date_joined) >= subDays(new Date(), 7),
    ).length ?? pendingSinceLastWeek;
  const suspendedUsersValue =
    statsUsers?.filter((user) => user.status === "suspended").length ?? suspendedUsers;
  const inactiveUsersValue =
    statsUsers?.filter((user) => user.status === "inactive").length ?? inactiveUsers;

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage users and account access</p>
        </div>
        {demoSession && (
          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setIsEditModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus size={16} />
            Add user
          </button>
        )}
      </div>

      {demoSession && (
        <p className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Demo users are saved in this browser only.
        </p>
      )}
      {demoUsersError && (
        <p role="alert" className="mb-5 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {demoUsersError}
        </p>
      )}
      {statsError && !demoSession && (
        <p role="alert" className="mb-5 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {statsError}
        </p>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.role}
            onClick={() => setActiveTab(tab.role)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
              ${activeTab === tab.role
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard 
          label="Total Users" 
          value={totalUsersValue}
          description={`${usersSinceLastMonthValue.toLocaleString()} joined in the last month`}
        />
        <StatCard 
          label="Active Users" 
          value={activeUsersValue}
          description={`${activeSinceLastWeekValue.toLocaleString()} of ${activeUsersValue.toLocaleString()} joined in the last 7 days`}
        />
        <StatCard 
          label="Pending Users" 
          value={pendingUsersValue}
          description={`${pendingSinceLastWeekValue.toLocaleString()} of ${pendingUsersValue.toLocaleString()} joined in the last 7 days`}
        />
        <StatCard
          label="Suspended Users"
          value={suspendedUsersValue}
          description="Current status total"
        />
        <StatCard
          label="Inactive Users"
          value={inactiveUsersValue}
          description="Current status total"
        />
      </div>

      {/* ── Users Table ── */}
      <div className="bg-white rounded-xl border border-border">
        <UsersTable
          roleFilter={activeTab}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          demoUsers={demoSession ? demoUsersForTab : undefined}
          onUpdateDemoStatus={demoSession ? updateDemoUserStatus : undefined}
        />
      </div>

      {/* ── Edit User Modal ── */}
      {isEditModalOpen && (
        <UserFormModal
          mode={selectedUser ? "edit" : "create"}
          user={selectedUser ?? undefined}
          isOpen={isEditModalOpen}
          onSave={demoSession ? saveUser : undefined}
          onClose={() => { setIsEditModalOpen(false); setSelectedUser(null); }}
        />
      )}

      {/* ── Profile Modal ── */}
      {selectedUser && isProfileModalOpen && (
        <UserProfileModal
          user={selectedUser}
          isOpen={isProfileModalOpen}
          onClose={() => { setIsProfileModalOpen(false); setSelectedUser(null); }}
          onEdit={() => { setIsProfileModalOpen(false); setIsEditModalOpen(true); }}
        />
      )}

      {/* ── Delete Dialog ── */}
      {selectedUser && isDeleteDialogOpen && (
        <DeleteUserDialog
          user={selectedUser}
          isOpen={isDeleteDialogOpen}
          onDelete={
            demoSession
              ? async () => {
                  if (!deleteDemoUser(selectedUser)) {
                    throw new Error("Could not save the updated demo user list.");
                  }
                }
              : undefined
          }
          onDeleted={() => {
            if (!demoSession) window.location.reload();
          }}
          onClose={() => { setIsDeleteDialogOpen(false); setSelectedUser(null); }}
        />
      )}
    </div>
  );
}

// ── Stat card component ──
function StatCard({ label, value, description }: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground">
        {value.toLocaleString()}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}