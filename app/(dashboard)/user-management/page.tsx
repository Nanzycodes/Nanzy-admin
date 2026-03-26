"use client";

import { useState, useEffect } from "react";
import UsersTable from "@/components/users/users-table";
import UserFormModal from "@/components/users/user-form-modal";
import UserProfileModal from "@/components/users/user-profile-modal";
import DeleteUserDialog from "@/components/users/delete-user-dialog";
import { User, UserRole } from "@/types/user";
import apiClient from "@/lib/apiclient";
import { subDays, subMonths, format } from "date-fns";

const TABS: { label: string; role: UserRole | "all" }[] = [
  { label: "Users", role: "all" },
  { label: "Sellers", role: "seller" },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserRole | "all">("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ── Stat counts ──
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersSinceLastMonth, setUsersSinceLastMonth] = useState(0);

  const [activeUsers, setActiveUsers] = useState(0);
  const [activeSinceLastWeek, setActiveSinceLastWeek] = useState(0);

  const [pendingUsers, setPendingUsers] = useState(0);
  const [pendingSinceLastWeek, setPendingSinceLastWeek] = useState(0);

  useEffect(() => {
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
          pendingLastWeekRes
        ] = await Promise.all([
          apiClient.get(`/admin/customers/?page_size=1`),
          apiClient.get(`/admin/customers/?created_after=${lastMonth}&page_size=1`),
          apiClient.get(`/admin/customers/?status=active&page_size=1`),
          apiClient.get(`/admin/customers/?status=active&created_after=${lastWeek}&page_size=1`),
          apiClient.get(`/admin/customers/?status=pending&page_size=1`),
          apiClient.get(`/admin/customers/?status=pending&created_after=${lastWeek}&page_size=1`)
        ]);

        // Safely extract counts based on our nested data discovery
        setTotalUsers(totalRes.data?.data?.count ?? 0);
        setUsersSinceLastMonth(totalLastMonthRes.data?.data?.count ?? 0);

        setActiveUsers(activeRes.data?.data?.count ?? 0);
        setActiveSinceLastWeek(activeLastWeekRes.data?.data?.count ?? 0);

        setPendingUsers(pendingRes.data?.data?.count ?? 0);
        setPendingSinceLastWeek(pendingLastWeekRes.data?.data?.count ?? 0);
      } catch {
        // silently fail
      }
    }
    fetchCounts();
  }, []);

  const handleViewDetails = (user: User) => { setSelectedUser(user); setIsProfileModalOpen(true); };
  const handleEdit = (user: User) => { setSelectedUser(user); setIsEditModalOpen(true); };
  const handleDelete = (user: User) => { setSelectedUser(user); setIsDeleteDialogOpen(true); };

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage users</p>
        </div>
      </div>

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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard 
          label="Total Users" 
          value={totalUsers} 
          trend={`${usersSinceLastMonth.toLocaleString()} since last month`} 
        />
        <StatCard 
          label="Active Users" 
          value={activeUsers} 
          trend={`${activeSinceLastWeek.toLocaleString()} since last week`} 
        />
        <StatCard 
          label="Pending Users" 
          value={pendingUsers} 
          trend={`${pendingSinceLastWeek.toLocaleString()} since last week`} 
        />
      </div>

      {/* ── Users Table ── */}
      <div className="bg-white rounded-xl border border-border">
        <UsersTable
          roleFilter={activeTab}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* ── Edit User Modal ── */}
      {selectedUser && isEditModalOpen && (
        <UserFormModal
          mode="edit"
          user={selectedUser}
          isOpen={isEditModalOpen}
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
          onDeleted={() => window.location.reload()}
          onClose={() => { setIsDeleteDialogOpen(false); setSelectedUser(null); }}
        />
      )}
    </div>
  );
}

// ── Stat card component ──
function StatCard({ label, value, trend }: {
  label: string;
  value: number;
  trend: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">{trend}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1L9.33013 8.5H0.669873L5 1Z" fill="#22C55E" />
        </svg>
      </div>
      <p className="text-3xl font-bold text-foreground">
        {value.toLocaleString()}
      </p>
    </div>
  );
}