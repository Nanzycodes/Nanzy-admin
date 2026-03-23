"use client";

// ─────────────────────────────────────────────
// components/users/delete-user-dialog.tsx
//
// A simple "Are you sure?" dialog that appears
// before deleting a user.
// ─────────────────────────────────────────────

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";

// ── Props ──
interface DeleteUserDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteUserDialog({
  user,
  isOpen,
  onClose,
}: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      // TODO: call your delete API here
      // e.g. await deleteUser(user.id)
      console.log("Deleting user:", user.id);
      onClose();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    // ── Overlay ──
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      {/* ── Dialog box ── */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Warning icon + message */}
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={22} className="text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-1">
              Delete User
            </h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{user.name}</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
