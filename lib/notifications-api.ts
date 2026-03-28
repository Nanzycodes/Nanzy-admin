import apiClient from "@/lib/apiclient";

export interface Notification {
  id: string;
  category: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  [key: string]: any;
}

const BASE = "notifications";

export const notificationsApi = {
  list: () =>
    apiClient.get<Notification[]>(`${BASE}/`),

  markAsRead: (notificationId: string) =>
    apiClient.patch(`${BASE}/${notificationId}/read/`),

  markAllRead: () =>
    apiClient.post(`${BASE}/mark-all-read/`),

  getPreferences: () =>
    apiClient.get<NotificationPreferences>(`${BASE}/preferences/`),

  updatePreferences: (data: Partial<NotificationPreferences>) =>
    apiClient.patch(`${BASE}/preferences/`, data),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>(`${BASE}/unread-count/`),
};

export default notificationsApi;
