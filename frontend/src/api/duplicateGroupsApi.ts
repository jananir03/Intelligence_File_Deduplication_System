import api from "./axios";
import type { DuplicateGroupDetail, DuplicateGroupListResponse } from "../types/duplicateGroups";

export const getDuplicateGroups = async (page = 1, pageSize = 9): Promise<DuplicateGroupListResponse> => {
  const response = await api.get<DuplicateGroupListResponse>("/api/v1/duplicate-groups", {
    params: { page, page_size: pageSize },
  });
  return response.data;
};

export const getDuplicateGroupDetail = async (groupId: number): Promise<DuplicateGroupDetail> => {
  const response = await api.get<DuplicateGroupDetail>(`/api/v1/duplicate-groups/${groupId}`);
  return response.data;
};
