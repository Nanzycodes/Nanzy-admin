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