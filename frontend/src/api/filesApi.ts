import api from "./axios";
import type {
  BasicFileListResponse,
  FileItem,
  FileListResponse,
  FileSearchParams,
  FileUploadResponse,
} from "../types/files";

export const getFiles = async (
  params: FileSearchParams,
): Promise<FileListResponse> => {
  const response = await api.get<FileListResponse>(
    "/api/v1/file-management/files",
    { params },
  );

  return response.data;
};

export const getBasicFiles = async (
  search?: string,
): Promise<BasicFileListResponse> => {
  const response = await api.get<BasicFileListResponse>(
    "/api/v1/files",
    {
      params: {
        search: search?.trim() || undefined,
        skip: 0,
        limit: 20,
      },
    },
  );

  return response.data;
};

export const getFileDetails = async (fileId: number): Promise<FileItem> => {
  const response = await api.get<FileItem>(`/api/v1/files/${fileId}`);
  return response.data;
};

export const uploadFile = async (
  file: File,
  onProgress?: (percentage: number) => void,
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append("uploaded_file", file);

  const response = await api.post<FileUploadResponse>(
    "/api/v1/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return;
        onProgress(Math.round((event.loaded * 100) / event.total));
      },
    },
  );

  return response.data;
};

export const downloadFile = async (
  fileId: number,
  fallbackFilename: string,
): Promise<void> => {
  const response = await api.get<Blob>(
    `/api/v1/files/${fileId}/download`,
    { responseType: "blob", timeout: 120000 },
  );

  const disposition = response.headers["content-disposition"] as string | undefined;
  const filenameMatch = disposition?.match(/filename="?([^";]+)"?/i);
  const filename = filenameMatch?.[1] ?? fallbackFilename;

  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};


export interface DeleteFileResponse {
  message: string;
  file_id: number;
  original_filename: string;
  deleted_from_database: boolean;
  physical_file_deleted: boolean;
  was_duplicate: boolean;
  was_original: boolean;
  new_original_file_id: number | null;
  duplicate_group_id: number | null;
  remaining_files_in_group: number;
  warning: string | null;
}

export const deleteFile = async (
  fileId: number,
  reason?: string,
): Promise<DeleteFileResponse> => {
  const response = await api.delete<DeleteFileResponse>(
    `/api/v1/file-management/files/${fileId}`,
    { data: { confirm: true, reason: reason?.trim() || undefined } },
  );
  return response.data;
};
