"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  X,
  Mail,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteAdminSchema } from "@/lib/schema";
import z from "zod";
import adminAuthApi from "@/lib/auth";
import InputWrapper from "@/components/input-container";
import { User } from "lucide-react";
import AdminsTable from "@/components/settings/admins-table";

const sections = [
  {
    title: "User Management",
    actions: [
      { label: "View all accounts", admin: true, superAdmin: true },
      { label: "Activate accounts", admin: false, superAdmin: true },
      { label: "Suspend accounts", admin: false, superAdmin: true },
      { label: "Delete accounts", admin: false, superAdmin: true },
    ],
  },
  {
    title: "Product Management",
    actions: [
      { label: "View all products", admin: true, superAdmin: true },
      {
        label: "Approve/Reject product application",
        admin: true,
        superAdmin: true,
      },
    ],
  },
  {
    title: "Delivery Partners",
    actions: [
      { label: "View all partners", admin: true, superAdmin: true },
      {
        label: "Approve/Reject partners application",
        admin: true,
        superAdmin: true,
      },
    ],
  },
];

function PermissionBox({ checked }: { checked: boolean }) {
  return (
    <div
      className={`w-5 h-5 rounded-[3px] border flex items-center justify-center ${
        checked ? "bg-[#ECEBFF] border-[#635BFF]" : "bg-white border-[#E6E6E6]"
      }`}
    >
      {checked && (
        <Check size={12} className="text-[#635BFF]" strokeWidth={3} />
      )}
    </div>
  );
}

type InviteFormValues = z.infer<typeof inviteAdminSchema>;
type RoleView = "superAdmin" | "admin";

const UserRoles = () => {
  const [activeRole, setActiveRole] = useState<RoleView>("superAdmin");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { control, handleSubmit, reset } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { email: "", first_name: "", last_name: "" },
  });

  const onSubmit = async (data: InviteFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      await adminAuthApi.inviteAdmin(data);
      setInvitedEmail(data.email);
      setInviteOpen(false);
      setSuccessOpen(true);
      reset();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          "Failed to send invite.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Left nav */}
      <div className="flex flex-col gap-2 min-w-30">
        <button
          onClick={() => setActiveRole("superAdmin")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[5px] text-sm font-medium text-left transition-colors cursor-pointer ${
            activeRole === "superAdmin"
              ? "bg-[#635BFF] text-white"
              : "bg-transparent text-[#9E9E9E]"
          }`}
        >
          <span
            className={`flex items-center justify-center w-6 h-6 rounded-full ${
              activeRole === "superAdmin" ? "bg-white/20" : "bg-[#F0F0F0]"
            }`}
          >
            <UserRound size={14} />
          </span>
          Super Admin
        </button>
        <button
          onClick={() => setActiveRole("admin")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[5px] text-sm font-medium text-left transition-colors cursor-pointer ${
            activeRole === "admin"
              ? "bg-[#635BFF] text-white"
              : "bg-transparent text-[#9E9E9E]"
          }`}
        >
          <span
            className={`flex items-center justify-center w-6 h-6 rounded-full ${
              activeRole === "admin" ? "bg-white/20" : "bg-[#F0F0F0]"
            }`}
          >
            <UserRound size={14} />
          </span>
          admin
        </button>
      </div>

      {/* Right content */}
      <div className="flex-1">
        {activeRole === "superAdmin" && (
          <div className="flex flex-col gap-4">
            {/* Top bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
                />
                <Input placeholder="Search" className="pl-8" />
              </div>
              {/* <button className="w-9 h-9 flex items-center justify-center rounded-[5px] border border-[#E6E6E6] bg-white cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                <SlidersHorizontal size={15} className="text-[#616161]" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-[5px] border border-[#E6E6E6] bg-white cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                <ArrowUpRight size={15} className="text-[#616161]" />
              </button> */}

              {/* Invite modal */}
              <Dialog
                open={inviteOpen}
                onOpenChange={(open) => {
                  setInviteOpen(open);
                  if (!open) {
                    reset();
                    setError("");
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-[#635BFF] hover:bg-[#4f48cc] text-white rounded-[5px] text-sm cursor-pointer">
                    Invite members
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  className="sm:max-w-md p-6"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-mono font-bold text-[24px] leading-[110%] tracking-[0%] text-[#212121]">
                        Invite team
                      </h2>
                      <p className="font-mono font-normal text-[14px] leading-[110%] tracking-[0%] text-[#616161]">
                        Invite your team to become an admin
                      </p>
                    </div>
                    <button
                      onClick={() => setInviteOpen(false)}
                      className="w-11 h-10 flex items-center justify-center rounded-[5px] bg-[#F5F5F5] cursor-pointer"
                    >
                      <X size={16} className="text-pink-700" />
                    </button>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-y-4 mt-2"
                  >
                    <div className="flex flex-col gap-y-1">
                      <label className="font-mono font-normal text-[14px] leading-[110%] text-[#616161]">
                        First name
                      </label>
                      <InputWrapper
                        type="text"
                        name="first_name"
                        placeholder="Enter first name"
                        control={control}
                        startIcon={<User size={16} className="text-primary" />}
                      />
                    </div>

                    <div className="flex flex-col gap-y-1">
                      <label className="font-mono font-normal text-[14px] leading-[110%] text-[#616161]">
                        Last name
                      </label>
                      <InputWrapper
                        type="text"
                        name="last_name"
                        placeholder="Enter last name"
                        control={control}
                        startIcon={<User size={16} className="text-primary" />}
                      />
                    </div>

                    <div className="flex flex-col gap-y-1">
                      <label className="font-mono font-normal text-[14px] leading-[110%] text-[#616161]">
                        Enter invitee email
                      </label>
                      <InputWrapper
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        control={control}
                        startIcon={<Mail size={16} className="text-primary" />}
                      />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button
                      type="submit"
                      className="w-full rounded-[5px] bg-primary text-sm text-white py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send invite"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Success modal */}
            <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
              <DialogContent
                showCloseButton={false}
                className="sm:max-w-sm p-6"
              >
                <div className="flex justify-end">
                  <button
                    onClick={() => setSuccessOpen(false)}
                    className="w-11 h-10 flex items-center justify-center rounded-[5px] bg-[#F5F5F5] cursor-pointer"
                  >
                    <X size={16} className="text-pink-700" />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4 pb-2">
                  <Image
                    src="/images/successTick.svg"
                    alt="Success"
                    width={80}
                    height={80}
                  />
                  <h2 className="font-mono font-medium text-[24px] leading-[110%] tracking-[0%] text-[#212121] text-center">
                    Invitation Sent
                  </h2>
                  <p className="font-mono font-normal text-[14px] leading-[110%] tracking-[0%] text-[#616161] text-center">
                    {invitedEmail} has been invited to join you as an admin
                  </p>
                  <Button
                    onClick={() => setSuccessOpen(false)}
                    className="w-full rounded-[5px] bg-primary text-sm text-white py-5 cursor-pointer"
                  >
                    Done
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Permissions table */}
            <div className="w-full">
              <div className="grid grid-cols-[1fr_100px_120px] pb-3 border-b border-[#E6E6E6]">
                <span className="text-sm font-semibold text-black">
                  Actions
                </span>
                <span className="text-sm font-semibold text-black text-center">
                  Admin
                </span>
                <span className="text-sm font-semibold text-black text-center">
                  Super admin
                </span>
              </div>
              {sections.map((section) => (
                <div key={section.title}>
                  <div className="py-3 border-b border-[#E6E6E6]">
                    <span className="text-sm font-semibold text-black">
                      {section.title}
                    </span>
                  </div>
                  {section.actions.map((action) => (
                    <div
                      key={action.label}
                      className="grid grid-cols-[1fr_100px_120px] items-center py-3 border-b border-[#E6E6E6]"
                    >
                      <span className="text-sm text-[#616161]">
                        {action.label}
                      </span>
                      <div className="flex justify-center">
                        <PermissionBox checked={action.admin} />
                      </div>
                      <div className="flex justify-center">
                        <PermissionBox checked={action.superAdmin} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeRole === "admin" && <AdminsTable />}
      </div>
    </div>
  );
};

export default UserRoles;
