import api from "./axios";
import type { AuditLogListResponse, AuditLogSearchParams } from "../types/auditLogs";

export const getAuditLogs = async (params: AuditLogSearchParams): Promise<AuditLogListResponse> => {
  const response = await api.get<AuditLogListResponse>("/api/v1/audit-logs", { params });
  return response.data;
};
