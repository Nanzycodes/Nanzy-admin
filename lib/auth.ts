import { clearDemoSession, isDemoSession } from "@/lib/demo-mode";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { AdminEntry } from "@/types/user";

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data?: { access?: string; refresh?: string };
}

export interface AcceptInviteRequest {
  token: string;
  password: string;
  password_confirm: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string;
  status: string;
  is_active: boolean;
  date_joined: string;
}

const demoProfile: AdminProfile = {
  id: "demo-admin",
  email: "admin@nanzy.demo",
  first_name: "Nanzy",
  last_name: "Admin",
  roles: "admin",
  status: "active",
  is_active: true,
  date_joined: "2025-01-01T00:00:00.000Z",
};

function configurationError(): Error {
  return new Error(
    "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or use demo mode.",
  );
}

function getMetadataString(
  metadata: Record<string, unknown>,
  key: string,
): string {
  const value = metadata[key];
  return typeof value === "string" ? value : "";
}

export const adminAuthApi = {
  async login({ email, password }: AdminLoginRequest): Promise<AdminLoginResponse> {
    if (!supabase) throw configurationError();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, message: error.message };

    if (data.user.app_metadata.role !== "admin") {
      await supabase.auth.signOut();
      return {
        success: false,
        message:
          "This account does not have the admin role. Ask a project owner to grant admin access in Supabase.",
      };
    }

    return { success: true, message: "Signed in." };
  },

  async acceptInvite(
    data: AcceptInviteRequest,
  ): Promise<AcceptInviteResponse> {
    void data;
    return {
      success: false,
      message:
        "Admin invitations are managed from the Supabase project dashboard. Invite the user there, then assign the admin role.",
    };
  },

  async forgotPassword({
    email,
  }: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    if (!supabase) throw configurationError();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error
      ? { success: false, message: error.message }
      : { success: true, message: "Password reset email sent." };
  },

  async resetPassword(
    { new_password }: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    if (!supabase) throw configurationError();

    const { error } = await supabase.auth.updateUser({
      password: new_password,
    });
    return error
      ? { success: false, message: error.message }
      : { success: true, message: "Password updated." };
  },

  async inviteAdmin(_data: {
    email: string;
    first_name: string;
    last_name: string;
  }): Promise<void> {
    void _data;
    throw new Error(
      "Admin invitations require a trusted server-side email function. Invite users from the Supabase dashboard; never expose a service-role key in this app.",
    );
  },

  async changePassword(password: string): Promise<void> {
    if (!supabase) throw configurationError();

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async getProfile(): Promise<AdminProfile> {
    if (isDemoSession()) return demoProfile;
    if (!supabase) throw configurationError();

    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user || data.user.app_metadata.role !== "admin") {
      throw new Error("The signed-in account does not have admin access.");
    }

    const metadata = data.user.user_metadata;
    return {
      id: data.user.id,
      email: data.user.email ?? "",
      first_name: getMetadataString(metadata, "first_name"),
      last_name: getMetadataString(metadata, "last_name"),
      roles: "admin",
      status: "active",
      is_active: true,
      date_joined: data.user.created_at,
    };
  },

  async getAdmins(): Promise<{ count: number; results: AdminEntry[] }> {
    if (isDemoSession()) {
      return {
        count: 1,
        results: [
          {
            id: demoProfile.id,
            email: demoProfile.email,
            first_name: demoProfile.first_name,
            last_name: demoProfile.last_name,
            roles: demoProfile.roles,
            status: "active",
            is_active: true,
            date_joined: demoProfile.date_joined,
          },
        ],
      };
    }
    throw new Error(
      "Listing auth users requires a trusted server-side function. Manage admin accounts in the Supabase dashboard.",
    );
  },

  async logout(): Promise<void> {
    clearDemoSession();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  isAuthenticated(): boolean {
    return isDemoSession();
  },
};

export { isSupabaseConfigured };
export default adminAuthApi;
