import apiClient from "@/lib/apiclient";

export async function fetchAnalytics() {
  const response = await apiClient.get("/api/v1/admin/dashboard/analytics/");
  return response.data;
}
