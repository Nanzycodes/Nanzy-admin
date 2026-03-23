"use client";

// ─────────────────────────────────────────────
// app/(dashboard)/users/page.tsx
// ─────────────────────────────────────────────

import { useState } from "react";
// import { Plus } from "lucide-react"; // ❌ removed (no create)
import UsersTable from "@/components/users/users-table";
import UserFormModal from "@/components/users/user-form-modal"; // ✅ needed for edit
import UserProfileModal from "@/components/users/user-profile-modal";
import DeleteUserDialog from "@/components/users/delete-user-dialog";
import { User, UserRole } from "@/types/user";

// ❌ Influencer removed
const TABS: { label: string; role: UserRole | "all" }[] = [
  { label: "Users", role: "all" },
  { label: "Sellers", role: "seller" },
  { label: "Delivery Partners", role: "delivery_partner" },
];

export default function UsersPage() {
  // Active tab
  const [activeTab, setActiveTab] = useState<UserRole | "all">("all");

  // ❌ Create modal removed
  // const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ✅ Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ── Actions ──
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage users</p>
        </div>

        {/* ❌ Create button removed */}
        {/*
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create User
        </Button>
        */}
      </div>

      {/* ── Tabs ── */}
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

      {/* ── Users Table ── */}
      <UsersTable
        roleFilter={activeTab}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* ── Edit User Modal ── */}
      {selectedUser && isEditModalOpen && (
        <UserFormModal
          mode="edit"
          user={selectedUser}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* ── Profile Modal ── */}
      {selectedUser && isProfileModalOpen && (
        <UserProfileModal
          user={selectedUser}
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedUser(null);
          }}
          onEdit={() => {
            setIsProfileModalOpen(false);
            setIsEditModalOpen(true);
          }}
        />
      )}

      {/* ── Delete Dialog ── */}
      {selectedUser && isDeleteDialogOpen && (
        <DeleteUserDialog
          user={selectedUser}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}