"use client";

// ─────────────────────────────────────────────
// components/users/user-form-modal.tsx
//
// This one modal handles BOTH create and edit.
// When mode="create" → empty form
// When mode="edit"   → form pre-filled with user data
// ─────────────────────────────────────────────

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserRole } from "@/types/user";

// ── What fields are in the form ──
type FormValues = {
  name: string;
  email: string;
  role: UserRole;
  password: string;
};

// ── Props this component accepts ──
interface UserFormModalProps {
  mode: "create" | "edit";
  user?: User;           // only passed when mode="edit"
  isOpen: boolean;
  onClose: () => void;
}

export default function UserFormModal({
  mode,
  user,
  isOpen,
  onClose,
}: UserFormModalProps) {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      password: "",
    },
  });

  // When editing, pre-fill the form with existing user data
  useEffect(() => {
    if (isEdit && user) {
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("role", user.role);
    } else {
      reset(); // clear form when creating
    }
  }, [user, isEdit, isOpen]);

  // Called when the form is submitted
  async function onSubmit(data: FormValues) {
    try {
      if (isEdit) {
        // TODO: call your update API here
        console.log("Updating user:", data);
      } else {
        // TODO: call your create API here
        console.log("Creating user:", data);
      }
      onClose();
      reset();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  }

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    // ── Dark overlay behind the modal ──
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} // clicking outside closes the modal
    >
      {/* ── The white modal box ── */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit User" : "Create User"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Role dropdown */}
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select
              defaultValue={user?.role ?? "user"}
              onValueChange={(val) => setValue("role", val as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="delivery_partner">Delivery Partner</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password field — only shown when creating */}
          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
