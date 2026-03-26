import apiClient from "./apiclient";
import { ApiResponse, PaginatedProductList, ProductDetail } from "@/types/product";

export const productsApi = {
  list(params?: { page?: number; page_size?: number; search?: string }) {
    return apiClient.get<ApiResponse<PaginatedProductList>>("/admin/products/", { params });
  },

  retrieve(id: number) {
    return apiClient.get<ApiResponse<ProductDetail>>(`/admin/products/${id}/`);
  },

  delete(id: number) {
    return apiClient.delete(`/admin/products/${id}/delete/`);
  },
};
