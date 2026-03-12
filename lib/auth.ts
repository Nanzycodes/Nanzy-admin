import apiClient, { setAuthTokens, clearAuthTokens } from "@/lib/apiclient";

// ============================================
// Admin Auth Types
// ============================================

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  email: string; // Matches the API doc response
}

// Accept Invite
export interface AcceptInviteRequest {
  token: string;
  password: string;
  password_confirm: string;
}

export interface AcceptInviteResponse {
  token: string;
}

// Forgot Password (request a reset email)
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  email: string; // matches your API doc
}

// Reset Password (set new password)
export interface ResetPasswordRequest {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ResetPasswordResponse {
  uid: string;
  token: string;
}

// ============================================
// Admin Auth API Functions
// ============================================

const ADMIN_BASE = "/api/v1/admin";

export const adminAuthApi = {
  // Admin Login
  // ------------------------------
  // Login
  // ------------------------------
  login: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await apiClient.post<AdminLoginResponse>(
      `${ADMIN_BASE}/login/`,
      data
    );
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