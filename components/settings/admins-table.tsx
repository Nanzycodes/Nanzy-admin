"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Mail, Trash2 } from "lucide-react";
import { User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteAdminSchema } from "@/lib/schema";
import z from "zod";
import adminAuthApi from "@/lib/auth";
import InputWrapper from "@/components/input-container";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminEntry } from "@/types/user";

type InviteFormValues = z.infer<typeof inviteAdminSchema>;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

const STATUS_STYLES: Record<AdminEntry["status"], string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  suspended: "bg-red-50 text-red-600 border-red-200",
  inactive: "bg-pink-50 text-pink-600 border-pink-200",
};

function AdminStatusBadge({ status }: { status: AdminEntry["status"] }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${STATUS_STYLES[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminsTable() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminEntry | null>(null);

  const { control, handleSubmit, reset } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { email: "", first_name: "", last_name: "" },
  });

  useEffect(() => {
    adminAuthApi
      .getAdmins()
      .then((res) => setAdmins(res.results))
      .catch((err) => {
        if (err?.response?.status === 401) {
          router.replace("/sign-in");
        } else {
          setError("Failed to load admins.");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const onSubmit = async (data: InviteFormValues) => {
    setInviteLoading(true);
    setInviteError("");
    try {
      await adminAuthApi.inviteAdmin(data);
      setInvitedEmail(data.email);
      setInviteOpen(false);
      setSuccessOpen(true);
      reset();
    } catch (err: any) {
      setInviteError(
        err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          "Failed to send invite."
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const columns: ColumnDef<AdminEntry>[] = [
    {
      key: "name",
      header: "Admin",
      cell: (admin) => (
        <div>
          <p className="font-medium text-foreground">
            {admin.first_name} {admin.last_name}
          </p>
          <p className="text-xs text-muted-foreground">#{admin.id.slice(0, 8)}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (admin) => <span className="text-muted-foreground">{admin.email}</span>,
    },
    {
      key: "roles",
      header: "Role",
      cell: (admin) => <span className="text-muted-foreground">{admin.roles}</span>,
    },
    {
      key: "date_joined",
      header: "Date joined",
      cell: (admin) => (
        <span className="text-muted-foreground">{formatDate(admin.date_joined)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (admin) => <AdminStatusBadge status={admin.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (admin) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center hover:opacity-70 transition-opacity">
              <span className="w-2 h-2 rounded-full border border-muted-foreground/40" />
              <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
              <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteTarget(admin)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const inviteButton = (
    <>
      <Dialog
        open={inviteOpen}
        onOpenChange={(open) => {
          setInviteOpen(open);
          if (!open) {
            reset();
            setInviteError("");
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className="bg-[#635BFF] hover:bg-[#4f48cc] text-white rounded-[5px] text-sm cursor-pointer">
            Invite members
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="sm:max-w-md p-6">
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

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4 mt-2">
            <div className="flex flex-col gap-y-1">
              <label className="font-mono font-normal text-[14px] leading-[110%] text-[#616161]">
                First name
              </label>
              <InputWrapper
                type="text"
                name="first_name"
                placeholder="Enter first name"
                control={control}
                startIcon={<UserIcon size={16} className="text-primary" />}
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
                startIcon={<UserIcon size={16} className="text-primary" />}
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
            {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
            <Button
              type="submit"
              className="w-full rounded-[5px] bg-primary text-sm text-white py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={inviteLoading}
            >
              {inviteLoading ? "Sending..." : "Send invite"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite success modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-6">
          <div className="flex justify-end">
            <button
              onClick={() => setSuccessOpen(false)}
              className="w-11 h-10 flex items-center justify-center rounded-[5px] bg-[#F5F5F5] cursor-pointer"
            >
              <X size={16} className="text-pink-700" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-4 pb-2">
            <Image src="/images/successTick.svg" alt="Success" width={80} height={80} />
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
    </>
  );

  if (loading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading admins...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-sm text-red-500">{error}</div>;
  }

  return (
    <>
      <DataTable<AdminEntry>
        data={admins}
        columns={columns}
        getSearchText={(a) => `${a.first_name} ${a.last_name} ${a.email}`}
        getDate={(a) => {
          const d = new Date(a.date_joined);
          return isNaN(d.getTime()) ? null : d;
        }}
        toolbarRight={inviteButton}
        emptyMessage="No admins found"
      />

      {/* Delete confirmation modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-6">
          <div className="flex justify-end">
            <button
              onClick={() => setDeleteTarget(null)}
              className="w-11 h-10 flex items-center justify-center rounded-[5px] bg-[#F5F5F5] cursor-pointer"
            >
              <X size={16} className="text-pink-700" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 pb-2">
            {/* Replace src with your actual image once provided */}
            <div className="w-20 h-20 rounded-full bg-[#FFF0F4] flex items-center justify-center">
              <Trash2 size={36} className="text-[#F30C5A]" />
            </div>

            <p
              className="text-center"
              style={{
                fontFamily: "Satoshi Variable, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "110%",
                letterSpacing: "0%",
                color: "#9E9E9E",
              }}
            >
              Are you sure you want to remove this admin?
            </p>

            <div className="flex gap-3 w-full mt-1">
              <button
                onClick={() => {
                  // TODO: call delete API here
                  setDeleteTarget(null);
                }}
                className="flex-1 py-[14px] rounded-[5px] cursor-pointer"
                style={{
                  background: "#F30C5A",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "140%",
                  letterSpacing: "-0.01em",
                  color: "#FFFFFF",
                }}
              >
                Yes, delete
              </button>

              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-[14px] rounded-[5px] border border-[#E6E6E6] cursor-pointer"
                style={{
                  background: "transparent",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "140%",
                  letterSpacing: "-0.01em",
                  color: "#212121",
                }}
              >
                No, cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
