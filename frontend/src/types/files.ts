export interface FileItem {
  id: number;
  original_filename: string;
  stored_filename?: string;
  file_size: number;
  mime_type: string | null;
  file_extension: string | null;
  file_hash_id?: number | null;
  status: string;
  is_protected: boolean;
  uploaded_at: string;
  updated_at?: string;
  is_duplicate?: boolean;
}

export interface FileListResponse {
  items: FileItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface BasicFileListResponse {
  items: FileItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface FileUploadResponse extends FileItem {
  message: string;
}

export type DuplicateFilter = "all" | "duplicate" | "unique";
export type SortField = "filename" | "size" | "uploaded_at" | "status" | "extension";
export type SortOrder = "asc" | "desc";

export interface FileSearchParams {
  filename?: string;
  file_type?: string;
  min_size?: number;
  max_size?: number;
  duplicate?: boolean;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
  sort_by?: SortField;
  sort_order?: SortOrder;
}

export interface DeleteFileRequest {
  confirm: boolean;
  reason?: string;
}

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
