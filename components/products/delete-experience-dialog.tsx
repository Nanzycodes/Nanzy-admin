"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { experiencesApi } from "@/lib/experiences-api";
import { ExperienceList } from "@/types/experience";

interface DeleteExperienceDialogProps {
  experience: ExperienceList;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteExperienceDialog({ experience, isOpen, onClose, onDeleted }: DeleteExperienceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await experiencesApi.delete(experience.id);
      onDeleted();
      onClose();
    } catch {
      setError("Failed to delete experience. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Delete Experience</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-md bg-[#FFE4E4] hover:bg-[#ffd0d0] transition-colors">
            <X size={16} className="text-[#E53935]" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{experience.business_name}</span>? This action cannot be undone.
        </p>

        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50">
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
