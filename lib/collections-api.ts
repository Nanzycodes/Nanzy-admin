import apiClient from "./apiclient";
import { ApiResponse } from "@/types/product";
import { ContentType, PaginatedContentList, ContentItem } from "@/types/collection";

export const collectionsApi = {
  list(params?: { content_type?: ContentType; page?: number; page_size?: number }) {
    return apiClient.get<ApiResponse<PaginatedContentList>>("/admin/content/", { params });
  },

  retrieve(contentType: ContentType, id: string | number) {
    return apiClient.get<ApiResponse<ContentItem>>(`/admin/content/${contentType}/${id}/`);
  },

  delete(contentType: ContentType, id: string | number) {
    return apiClient.delete(`/admin/content/${contentType}/${id}/delete/`);
  },
};
