"use client";

// ─────────────────────────────────────────────
// components/users/user-form-modal.tsx
//
// This one modal handles BOTH create and edit.
// When mode="create" → empty form
// When mode="edit"   → form pre-filled with user data
// ─────────────────────────────────────────────

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { User, UserRole, UserStatus } from "@/types/user";

// ── What fields are in the form ──
type FormValues = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  password: string;
};

// ── Props this component accepts ──
interface UserFormModalProps {
  mode: "create" | "edit";
  user?: User;           // only passed when mode="edit"
  isOpen: boolean;
  onClose: () => void;
  onSave?: (values: Omit<FormValues, "password">) => boolean | void;
}

export default function UserFormModal({
  mode,
  user,
  isOpen,
  onClose,
  onSave,
}: UserFormModalProps) {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      status: "active",
      password: "",
    },
  });
  const selectedRole = useWatch({ control, name: "role" });
  const selectedStatus = useWatch({ control, name: "status" });

  // When editing, pre-fill the form with existing user data
  useEffect(() => {
    if (isEdit && user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        password: "",
      });
    } else {
      reset({
        name: "",
        email: "",
        role: "user",
        status: "active",
        password: "",
      });
    }
  }, [user, isEdit, isOpen, reset]);

  // Called when the form is submitted
  async function onSubmit(data: FormValues) {
    try {
      if (isEdit) {
        if (onSave) {
          const saved = onSave({
            name: data.name.trim(),
            email: data.email.trim(),
            role: data.role,
            status: data.status,
          });
          if (saved === false) return;
        } else {
          console.log("Updating user:", data);
          onClose();
        }
      } else {
        if (onSave) {
          const saved = onSave({
            name: data.name.trim(),
            email: data.email.trim(),
            role: data.role,
            status: data.status,
          });
          if (saved === false) return;
        } else {
          console.log("Creating user:", data);
          onClose();
        }
      }
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
        className="max-h-[90vh] w-full max-w-md mx-4 overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="user-form-title" className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit User" : "Create User"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        {onSave && (
          <p className="mb-4 text-xs text-muted-foreground">
            Demo records stay in this browser. Passwords are never stored.
          </p>
        )}

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
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Role dropdown */}
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(val) => setValue("role", val as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-status">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(val) => setValue("status", val as UserStatus)}
            >
              <SelectTrigger id="user-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
