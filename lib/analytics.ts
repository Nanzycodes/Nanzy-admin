import apiClient from "@/lib/apiclient";

export async function fetchAnalytics() {
  const response = await apiClient.get("/admin/dashboard/analytics/");
  return response.data?.data ?? null;
}

export async function fetchCustomerMetrics() {
  try {
    const response = await apiClient.get("/admin/customers/metrics/");
    return response.data?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchTopContent() {
  try {
    const response = await apiClient.get("/admin/content/?page_size=5");
    return response.data?.data?.results ?? response.data?.results ?? [];
  } catch {
    return [];
  }
}

export async function fetchTopSellers() {
  try {
    const response = await apiClient.get("/admin/sellers/?page_size=5");
    return response.data?.data?.results ?? response.data?.results ?? [];
  } catch {
    return [];
  }
}