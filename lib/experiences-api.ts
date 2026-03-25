import apiClient from "./apiclient";
import { ApiResponse } from "@/types/product";
import { PaginatedExperienceList, ExperienceDetail } from "@/types/experience";

export const experiencesApi = {
  list(params?: { page?: number; page_size?: number; search?: string }) {
    return apiClient.get<ApiResponse<PaginatedExperienceList>>("/admin/experiences/", { params });
  },

  retrieve(id: number) {
    return apiClient.get<ApiResponse<ExperienceDetail>>(`/admin/experiences/${id}/`);
  },

  delete(id: number) {
    return apiClient.delete(`/admin/experiences/${id}/delete/`);
  },
};
