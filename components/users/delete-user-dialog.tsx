"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import apiClient from "@/lib/apiclient";

interface DeleteUserDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  onDelete?: () => Promise<void>;
}

export default function DeleteUserDialog({
  user,
  isOpen,
  onClose,
  onDeleted,
  onDelete,
}: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setError("");
    try {
      if (onDelete) await onDelete();
      else await apiClient.delete(`/admin/customers/${user.user_id}/delete/`);
      onClose();
      onDeleted?.();
    } catch {
      setError("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={22} className="text-destructive" />
          </div>
          <div>
            <h2 id="delete-user-title" className="text-base font-semibold text-foreground mb-1">Delete User</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{user.name}</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

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