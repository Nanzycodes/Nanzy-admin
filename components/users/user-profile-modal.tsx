"use client";

// ─────────────────────────────────────────────
// components/users/user-profile-modal.tsx
//
// Opens when "View Details" is clicked.
// Shows all info about a single user.
// ─────────────────────────────────────────────

import { X, Mail, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";

// ── Props ──
interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void; // called when "Edit" button is clicked inside profile
}

export default function UserProfileModal({
  user,
  isOpen,
  onClose,
  onEdit,
}: UserProfileModalProps) {
  if (!isOpen) return null;

  const roleLabel: Record<User["role"], string> = {
    user: "General User",
    seller: "Seller",
    influencer: "Influencer",
  };

  return (
    // ── Overlay ──
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      {/* ── Modal box ── */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">User Details</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.id}</p>
            {/* Status badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border mt-1
                ${user.status === "active"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : user.status === "suspended"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}
            >
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-4 mb-6">
          <InfoRow icon={<Mail size={15} />} label="Email" value={user.email} />
          <InfoRow icon={<Calendar size={15} />} label="Date Joined" value={user.date_joined} />
          <InfoRow icon={<Shield size={15} />} label="Role" value={roleLabel[user.role]} />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1" onClick={onEdit}>
            Edit User
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Small helper for a single info row ──
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
