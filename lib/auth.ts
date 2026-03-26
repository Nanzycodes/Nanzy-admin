import apiClient, { setAuthTokens, clearAuthTokens } from "@/lib/apiclient";

// ============================================
// Admin Auth Types
// ============================================

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    access?: string;
    refresh?: string;
    [key: string]: any;
  };
  errors?: any;
}

// Accept Invite
export interface AcceptInviteRequest {
  token: string;
  password: string;
  password_confirm: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    [key: string]: any;
  };
  errors?: any;
}

// Forgot Password (request a reset email)
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email?: string;
    [key: string]: any;
  };
  errors?: any;
}

// Reset Password (set new password)
export interface ResetPasswordRequest {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ResetPasswordResponse {
  //d: string;
 //oken: string;
 success: boolean;
  message: string;
  data?:any;
  errors?: any;
}

// ============================================
// Admin Profile Types
// ============================================

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

// ============================================
// Admin Auth API Functions
// ============================================

const ADMIN_BASE = "admin";

export const adminAuthApi = {
  // Admin Login
  
login: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await apiClient.post<AdminLoginResponse>(
    `${ADMIN_BASE}/login/`,
    data
  );

  // if tokens are returned, store them (common pattern)
  if (response.data?.data?.access) {
    setAuthTokens(response.data.data.access, response.data.data.refresh);
  }

  return response.data;
},
  // Accept Invite
  acceptInvite: async (
    data: AcceptInviteRequest
  ): Promise<AcceptInviteResponse> => {
    const response = await apiClient.post<AcceptInviteResponse>(
      `${ADMIN_BASE}/invite/accept/`,
      data
    );
    return response.data;
  },

  // Forgot Password (request reset email)
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>(
      `${ADMIN_BASE}/password-reset/`,
      data
    );
    return response.data;
  },

  // Reset Password (set new password)
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(
      `${ADMIN_BASE}/password-reset/confirm/`,
      data
    );
    return response.data;
  },

  // Invite admin
  inviteAdmin: async (data: {
    email: string;
    first_name: string;
    last_name: string;
  }): Promise<void> => {
    await apiClient.post(`${ADMIN_BASE}/invite/`, data);
  },

  // Change password
  changePassword: async (password: string): Promise<void> => {
    await apiClient.post(`${ADMIN_BASE}/change-password/`, { password });
  },

  // Get current admin profile
  getProfile: async (): Promise<AdminProfile> => {
    const response = await apiClient.get<{ data: AdminProfile }>(
      `${ADMIN_BASE}/me/profile/`
    );
    return response.data.data;
  },

  // List all admins
  getAdmins: async (): Promise<{ count: number; results: import("@/types/user").AdminEntry[] }> => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        count: number;
        next: string | null;
        previous: string | null;
        results: import("@/types/user").AdminEntry[];
      };
      errors: any;
    }>(`${ADMIN_BASE}/admins/`, { params: { page_size: 100 } });
    return response.data.data;
  },

  // Logout
  logout: () => {
    clearAuthTokens();
  },

  // Check if admin is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("access_token");
  },
};

export default adminAuthApi;